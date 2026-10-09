/**
 * MISSED. — Analysis Service Integration Contract
 * Defines client-backend interaction methods.
 */

import { ConversationInput, AnalysisStatus, AnalysisResult } from '../types';

export interface AnalysisServiceContract {
  /**
   * Submits a conversation for analysis
   */
  submitConversation(input: ConversationInput): Promise<{ jobId: string }>;

  /**
   * Queries real-time processing status of an active analysis
   */
  getAnalysisStatus(jobId: string): Promise<AnalysisStatus>;

  /**
   * Retrieves the completed structured analysis result
   */
  getAnalysisResult(jobId: string): Promise<AnalysisResult>;

  /**
   * Cancels an ongoing analysis job
   */
  cancelAnalysis(jobId: string): Promise<void>;

  /**
   * Permanently clears all stored data on the client/service
   */
  purgeAllData(): Promise<void>;
}
