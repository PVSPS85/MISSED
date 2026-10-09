/**
 * MISSED. — Analysis Service Implementation
 * Conforms to AnalysisServiceContract from shared definitions.
 * Provides client-side state handling and bridges to the upcoming backend.
 */

import {
  ConversationInput,
  AnalysisStatus,
  AnalysisResult,
  StageStatus
} from '@shared/types';
import { AnalysisServiceContract } from '@shared/contracts/analysis';

export const INITIAL_STAGES: StageStatus[] = [
  { id: 'preparing', label: 'Preparing Conversation', state: 'pending' },
  { id: 'reading', label: 'Reading the Conversation', state: 'pending' },
  { id: 'finding-signal', label: 'Finding the Signal', state: 'pending' },
  { id: 'building-catchup', label: 'Building Your Catch-Up', state: 'pending' },
  { id: 'verifying-evidence', label: 'Verifying the Evidence', state: 'pending' },
];

export class ClientAnalysisService implements AnalysisServiceContract {
  private activeJobs = new Map<string, { input: ConversationInput; status: AnalysisStatus }>();

  async submitConversation(input: ConversationInput): Promise<{ jobId: string }> {
    const jobId = `job-${Date.now()}`;
    const stages: StageStatus[] = INITIAL_STAGES.map((s, idx) => ({
      ...s,
      state: idx === 0 ? 'active' : 'pending'
    }));

    this.activeJobs.set(jobId, {
      input,
      status: {
        jobId,
        stages,
        currentStage: 'preparing',
        isCompleted: false,
        isFailed: false
      }
    });

    return { jobId };
  }

  async getAnalysisStatus(jobId: string): Promise<AnalysisStatus> {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    return job.status;
  }

  async getAnalysisResult(jobId: string): Promise<AnalysisResult> {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    throw new Error('Analysis engine is currently unavailable. Backend integration pending.');
  }

  async cancelAnalysis(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status.isFailed = true;
      job.status.errorMessage = 'Analysis cancelled by user.';
    }
  }

  async purgeAllData(): Promise<void> {
    this.activeJobs.clear();
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.clear();
    }
  }
}

export const analysisService = new ClientAnalysisService();
