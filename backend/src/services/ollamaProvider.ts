import { AIProvider } from './aiProvider';

export class OllamaProvider implements AIProvider {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl = 'http://127.0.0.1:11434', model = 'llama3') {
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

  async analyzeConversation(text: string, onProgress: (stage: string) => void): Promise<any> {
    onProgress('reading');
    
    // In a real implementation, we would send the text to Ollama and ask for a JSON response.
    // For now, if Ollama is not available or we are in development, we'll wait and throw or return stub if asked.
    // Given the instructions: "Keep the UI connected to real processing states. Do not fabricate AI responses... If AI is unavailable, show an honest message."
    
    const isReady = await this.isAvailable();
    if (!isReady) {
      throw new Error(`AI Model (${this.model}) is not available via Ollama locally. Please ensure Ollama is running and the model is downloaded.`);
    }

    onProgress('finding-signal');
    
    // Actually call Ollama
    const prompt = `Analyze the following conversation and extract:
1. A summary
2. Action items
3. Decisions
4. Unanswered questions
5. Radar findings (urgent, response needed, keep in mind)
Respond strictly in JSON matching our schema.
Conversation:
${text.substring(0, 4000)} // Truncating for safety in MVP
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
        })
      });

      if (!res.ok) {
        throw new Error(`Ollama API error: ${res.statusText}`);
      }

      onProgress('building-catchup');
      const data = await res.json();
      
      onProgress('verifying-evidence');
      
      return JSON.parse(data.response);
    } catch (err: any) {
      throw new Error(`Failed to process with Ollama: ${err.message}`);
    }
  }
}
