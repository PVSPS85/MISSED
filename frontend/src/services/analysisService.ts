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
  private baseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001') + '/api';

  async submitConversation(input: ConversationInput): Promise<{ jobId: string }> {
    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to submit conversation: ${response.statusText}`);
    }

    return response.json();
  }

  async getAnalysisStatus(jobId: string): Promise<AnalysisStatus> {
    const response = await fetch(`${this.baseUrl}/status/${jobId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch status: ${response.statusText}`);
    }
    return response.json();
  }

  async getAnalysisResult(jobId: string): Promise<AnalysisResult> {
    const response = await fetch(`${this.baseUrl}/result/${jobId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch result: ${response.statusText}`);
    }
    return response.json();
  }

  async cancelAnalysis(jobId: string): Promise<void> {
    // Optionally implement cancel on backend, for now just throwing local error is handled differently
    console.warn('Cancel analysis not fully implemented on backend yet.');
  }

  async purgeAllData(): Promise<void> {
    await fetch(`${this.baseUrl}/purge`, { method: 'DELETE' }).catch(() => {});
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.clear();
    }
  }
}

export const analysisService = new ClientAnalysisService();
