import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ConversationInput, AnalysisStatus, ProgressStage, AnalysisResult } from '@shared/types';
import { OllamaProvider } from '../services/ollamaProvider';
import { parseConversation } from '../core/parser';

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

router.post('/submit', async (req, res) => {
  try {
    const input: ConversationInput = req.body;
    
    // Validate input
    if (!input.rawText) {
      return res.status(400).json({ error: 'Missing conversation text.' });
    }

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

        // Mapping raw output to AnalysisResult based on types
        const finalResult: AnalysisResult = {
          id: jobId,
          createdAt: new Date().toISOString(),
          engine: 'model-ai',
          isSampleData: false,
          summary: resultData.summary || { overview: 'Summary missing', majorTopics: [], participants: [], totalMessages: 0, timespan: {} },
          radar: resultData.radar || { actNow: [], responseNeeded: [], keepInMind: [] },
          actionItems: resultData.actionItems || [],
          decisions: resultData.decisions || [],
          unansweredQuestions: resultData.unansweredQuestions || [],
          messages: [], // Populate with parsed messages if requested
          evidenceStore: {}, // We would map evidence IDs here
        };

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

export default router;
