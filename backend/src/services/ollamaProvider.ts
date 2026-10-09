import { AIProvider } from './aiProvider.js';
import { SourceMessage } from '@shared/types/index.js';

export class OllamaProvider implements AIProvider {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434', model = process.env.OLLAMA_MODEL || 'qwen2.5:3b') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return false;
      const data = await response.json();
      return data.models?.some((m: any) => m.name.includes(this.model)) || false;
    } catch (error) {
      console.warn('Ollama availability check failed:', error);
      return false;
    }
  }

  async chat(question: string, context: string): Promise<any> {
    const isReady = await this.isAvailable();
    if (!isReady) {
      throw new Error(`AI Model (${this.model}) is not available.`);
    }

    const prompt = `Answer the user's question based strictly on the provided conversation context.
If the answer is not in the context, say "I cannot answer this based on the conversation."
You MUST respond strictly in valid JSON matching this schema:
{
  "answer": "your answer here",
  "evidenceIds": ["<id>"]
}

Conversation:
${context.substring(0, 4000)}

Question:
${question}
`;

    try {
      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          format: 'json',
          stream: false,
          options: { temperature: 0.1 }
        })
      });

      if (!res.ok) throw new Error(`Ollama API error: ${res.statusText}`);
      
      const data = await res.json();
      let jsonStr = data.response.trim();
      if (jsonStr.startsWith('\`\`\`')) {
        jsonStr = jsonStr.replace(/^\`\`\`(json)?\s*/i, '').replace(/\s*\`\`\`$/, '');
      }
      return JSON.parse(jsonStr);
    } catch (err: any) {
      throw new Error(`Failed to process with Ollama: ${err.message}`);
    }
  }

  async analyzeConversation(messages: SourceMessage[], onProgress: (stage: string) => void): Promise<any> {
    onProgress('reading');
    
    const isReady = await this.isAvailable();
    if (!isReady) {
      throw new Error(`AI Model (${this.model}) is not available via Ollama locally. Please ensure Ollama is running and the model is downloaded.`);
    }

    onProgress('finding-signal');
    
    // Format messages for the prompt
    const textContext = messages.map(m => `[ID: ${m.id}] ${m.timestamp} - ${m.sender}: ${m.text}`).join('\n').substring(0, 4000);

    const prompt = `Analyze the following conversation and extract:
1. A summary (overview, majorTopics, participants, totalMessages, timespan)
2. Radar findings categorized by ACT_NOW, RESPONSE_NEEDED, KEEP_IN_MIND
3. Action items (with task, owner, deadline)
4. Decisions
5. Unanswered questions

You MUST respond strictly in valid JSON matching this schema structure:
{
  "summary": { "overview": "", "majorTopics": [ { "topic": "", "points": [""], "evidenceIds": ["<id>"] } ], "participants": [""], "totalMessages": 0, "timespan": { "start": "", "end": "" } },
  "radar": { 
    "actNow": [ { "id": "uuid", "category": "ACT_NOW", "title": "", "description": "", "reason": "", "evidenceIds": ["<id>"] } ],
    "responseNeeded": [ { "id": "uuid", "category": "RESPONSE_NEEDED", "title": "", "description": "", "reason": "", "evidenceIds": ["<id>"] } ],
    "keepInMind": [ { "id": "uuid", "category": "KEEP_IN_MIND", "title": "", "description": "", "reason": "", "evidenceIds": ["<id>"] } ]
  },
  "actionItems": [ { "id": "uuid", "task": "", "owner": "name or null", "ownerConfidence": "explicit", "deadline": "date or null", "deadlineType": "explicit", "priority": "normal", "evidenceIds": ["<id>"], "rawQuote": "" } ],
  "decisions": [ { "id": "uuid", "topic": "", "decision": "", "status": "confirmed", "evidenceIds": ["<id>"] } ],
  "unansweredQuestions": [ { "id": "uuid", "question": "", "askedBy": "", "evidenceIds": ["<id>"] } ]
}

IMPORTANT: Only use exact [ID: ...] values from the context in your evidenceIds arrays. Do NOT invent IDs. Do NOT wrap the JSON in markdown blocks like \`\`\`json. Output ONLY raw JSON.

Conversation:
${textContext}
`;

    try {
      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          format: 'json',
          stream: false,
          options: {
            temperature: 0.1
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Ollama API error: ${res.statusText}`);
      }

      onProgress('building-catchup');
      const data = await res.json();
      
      onProgress('verifying-evidence');
      
      let jsonStr = data.response.trim();
      // Clean up markdown wrapping if present
      if (jsonStr.startsWith('\`\`\`')) {
        jsonStr = jsonStr.replace(/^\`\`\`(json)?\s*/i, '').replace(/\s*\`\`\`$/, '');
      }
      
      return JSON.parse(jsonStr);
    } catch (err: any) {
      throw new Error(`Failed to process with Ollama: ${err.message}`);
    }
  }
}
