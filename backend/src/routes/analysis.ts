import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ConversationInput, AnalysisStatus, ProgressStage, AnalysisResult } from '@shared/types';
import { OllamaProvider } from '../services/ollamaProvider';
import { parseConversation } from '../core/parser';
import { ConversationInputSchema, AnalysisResultSchema } from '../schemas/index.js';

const router = Router();
const aiProvider = new OllamaProvider(); // Using default localhost:11434 and llama3

// In-memory stores for MVP
const jobsStore: Record<string, AnalysisStatus> = {};
const resultsStore: Record<string, AnalysisResult> = {};

function updateJobState(jobId: string, stage: ProgressStage, state: 'pending' | 'active' | 'completed' | 'failed', detail?: string) {
  const job = jobsStore[jobId];
  if (!job) return;

  const stageObj = job.stages.find(s => s.id === stage);
  if (stageObj) {
    stageObj.state = state;
    if (detail) stageObj.detail = detail;
  }
}

router.post('/analyze', async (req, res) => {
  try {
    const parseResult = ConversationInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid input data', details: parseResult.error.format() });
    }
    const input: ConversationInput = parseResult.data;

    // Check AI availability early
    const isAvailable = await aiProvider.isAvailable();
    if (!isAvailable) {
      return res.status(503).json({ error: 'AI Service is currently unavailable. Please check if Ollama is running.' });
    }

    const jobId = uuidv4();
    
    jobsStore[jobId] = {
      jobId,
      currentStage: 'preparing',
      isCompleted: false,
      isFailed: false,
      stages: [
        { id: 'preparing', label: 'Preparing', state: 'active' },
        { id: 'reading', label: 'Reading', state: 'pending' },
        { id: 'finding-signal', label: 'Finding Signal', state: 'pending' },
        { id: 'building-catchup', label: 'Building Catchup', state: 'pending' },
        { id: 'verifying-evidence', label: 'Verifying Evidence', state: 'pending' },
      ]
    };

    res.json({ jobId });

    // Process asynchronously
    (async () => {
      try {
        const parsedText = parseConversation(input.rawText);
        
        updateJobState(jobId, 'preparing', 'completed');
        jobsStore[jobId].currentStage = 'reading';

        const resultData = await aiProvider.analyzeConversation(parsedText, (stage) => {
          // Complete previous stages and set new active
          const stages: ProgressStage[] = ['preparing', 'reading', 'finding-signal', 'building-catchup', 'verifying-evidence'];
          const newIdx = stages.indexOf(stage as ProgressStage);
          if (newIdx > -1) {
            for (let i = 0; i < newIdx; i++) {
              updateJobState(jobId, stages[i], 'completed');
            }
            updateJobState(jobId, stages[newIdx], 'active');
            jobsStore[jobId].currentStage = stages[newIdx];
          }
        });

        // Use Zod schemas to validate output
        const validatedOutput = AnalysisResultSchema.safeParse(resultData);
        if (!validatedOutput.success) {
          throw new Error('AI output failed schema validation: ' + validatedOutput.error.message);
        }
        const validatedData = validatedOutput.data;

        // Verify evidence IDs against original messages
        const validIds = new Set(parsedText.map(m => m.id));
        const filterValidEvidence = (ids: string[]) => ids.filter(id => {
          const isValid = validIds.has(id);
          if (!isValid) console.warn(`Stripped invalid evidence ID: ${id}`);
          return isValid;
        });

        // Map and filter invalid evidence IDs
        validatedData.summary.majorTopics.forEach((t: any) => t.evidenceIds = filterValidEvidence(t.evidenceIds));
        const filterRadar = (findings: any[]) => findings.map(f => { f.evidenceIds = filterValidEvidence(f.evidenceIds); return f; });
        validatedData.radar.actNow = filterRadar(validatedData.radar.actNow);
        validatedData.radar.responseNeeded = filterRadar(validatedData.radar.responseNeeded);
        validatedData.radar.keepInMind = filterRadar(validatedData.radar.keepInMind);
        validatedData.actionItems.forEach((a: any) => a.evidenceIds = filterValidEvidence(a.evidenceIds));
        validatedData.decisions.forEach((d: any) => d.evidenceIds = filterValidEvidence(d.evidenceIds));
        validatedData.unansweredQuestions.forEach((q: any) => q.evidenceIds = filterValidEvidence(q.evidenceIds));

        // Mapping raw output to AnalysisResult based on types
        const finalResult: AnalysisResult = {
          id: jobId,
          createdAt: new Date().toISOString(),
          engine: 'model-ai',
          isSampleData: false,
          summary: validatedData.summary,
          radar: validatedData.radar,
          actionItems: validatedData.actionItems,
          decisions: validatedData.decisions,
          unansweredQuestions: validatedData.unansweredQuestions,
          messages: parsedText,
          evidenceStore: {}, 
        };

        // Populate evidenceStore for valid referenced messages
        parsedText.forEach(msg => {
          finalResult.evidenceStore[msg.id] = {
            id: msg.id,
            findingTitle: 'Source Message', // Placeholder, frontend can cross-reference
            category: 'KEEP_IN_MIND',
            basis: 'fact',
            messageId: msg.id,
            messageText: msg.text,
            sender: msg.sender,
            timestamp: msg.timestamp
          };
        });

        // Complete final stage
        updateJobState(jobId, 'verifying-evidence', 'completed');
        jobsStore[jobId].isCompleted = true;
        resultsStore[jobId] = finalResult;

      } catch (err: any) {
        jobsStore[jobId].isFailed = true;
        jobsStore[jobId].errorMessage = err.message || 'Unknown error occurred during analysis.';
        updateJobState(jobId, jobsStore[jobId].currentStage, 'failed', err.message);
      }
    })();

  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const status = jobsStore[jobId];
  if (!status) {
    return res.status(404).json({ error: 'Job not found.' });
  }
  res.json(status);
});

router.get('/result/:jobId', (req, res) => {
  const { jobId } = req.params;
  const result = resultsStore[jobId];
  if (!result) {
    return res.status(404).json({ error: 'Result not found or not yet ready.' });
  }
  res.json(result);
});

router.delete('/purge', (req, res) => {
  // Clear in-memory stores
  for (const key in jobsStore) delete jobsStore[key];
  for (const key in resultsStore) delete resultsStore[key];
  res.json({ success: true });
});

router.post('/chat', async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question || !context) {
      return res.status(400).json({ error: 'Missing question or context.' });
    }

    const isAvailable = await aiProvider.isAvailable();
    if (!isAvailable) {
      return res.status(503).json({ error: 'AI Service is currently unavailable.' });
    }

    // In a real implementation, we would query the AI model here
    // For now, we will throw a mock error or a stub response
    // The instructions say "Do not fabricate AI results"
    // So we will just return a structured response indicating we need the AI provider implemented for chat.
    res.json({
      answer: "Chat functionality requires a fully connected AI provider. It is currently under development.",
      evidenceIds: [],
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
