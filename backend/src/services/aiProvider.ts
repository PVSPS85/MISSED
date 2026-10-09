import { SourceMessage } from '@shared/types/index.js';

export interface AIProvider {
  /**
   * Checks if the AI provider is available and ready to process requests.
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Summarizes the text and extracts structured information.
   * We will refine this into multiple calls or a structured extraction call.
   */
  analyzeConversation(messages: SourceMessage[], onProgress: (stage: string) => void): Promise<any>;
}
