/**
 * MISSED. — Shared Domain Types
 * Shared across Frontend Website, Chrome Extension, and future Backend.
 */

export interface SourceMessage {
  id: string;
  index: number;
  raw: string;
  sender: string;
  timestamp: string;
  text: string;
  isSystem: boolean;
}

export type RadarPriority = 'ACT_NOW' | 'RESPONSE_NEEDED' | 'KEEP_IN_MIND';

export interface EvidenceReference {
  id: string;
  findingTitle: string;
  category: RadarPriority | 'ACTION' | 'DECISION' | 'QUESTION';
  basis: 'fact' | 'interpretation';
  messageId: string;
  messageText: string;
  sender?: string;
  timestamp?: string;
  lineIndex?: number;
  reason?: string;
}

export interface RadarFinding {
  id: string;
  category: RadarPriority;
  title: string;
  description: string;
  reason: string;
  evidenceIds: string[];
  sender?: string;
  timestamp?: string;
}

export type DeadlineType = 'explicit' | 'ambiguous' | 'none';

export interface ActionItem {
  id: string;
  task: string;
  owner: string | null;
  ownerConfidence: 'explicit' | 'inferred' | 'unassigned';
  deadline: string | null;
  deadlineType: DeadlineType;
  priority: 'urgent' | 'high' | 'normal';
  evidenceIds: string[];
  rawQuote: string;
}

export interface DecisionItem {
  id: string;
  topic: string;
  decision: string;
  status: 'confirmed' | 'proposed' | 'amended';
  decisionMaker?: string;
  evidenceIds: string[];
  timestamp?: string;
}

export interface UnansweredQuestion {
  id: string;
  question: string;
  askedBy: string;
  timestamp?: string;
  evidenceIds: string[];
}

export interface ConversationSummary {
  overview: string;
  majorTopics: {
    topic: string;
    points: string[];
    evidenceIds: string[];
  }[];
  participants: string[];
  totalMessages: number;
  timespan: {
    start?: string;
    end?: string;
  };
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  engine: 'rule-based' | 'model-ai';
  isSampleData: boolean;
  summary: ConversationSummary;
  radar: {
    actNow: RadarFinding[];
    responseNeeded: RadarFinding[];
    keepInMind: RadarFinding[];
  };
  actionItems: ActionItem[];
  decisions: DecisionItem[];
  unansweredQuestions: UnansweredQuestion[];
  messages: SourceMessage[];
  evidenceStore: Record<string, EvidenceReference>;
}

export type ProgressStage =
  | 'preparing'
  | 'reading'
  | 'finding-signal'
  | 'building-catchup'
  | 'verifying-evidence';

export type StageState = 'pending' | 'active' | 'completed' | 'failed' | 'unavailable';

export interface StageStatus {
  id: ProgressStage;
  label: string;
  state: StageState;
  detail?: string;
}

export interface AnalysisStatus {
  jobId: string;
  stages: StageStatus[];
  currentStage: ProgressStage;
  isCompleted: boolean;
  isFailed: boolean;
  errorMessage?: string;
}

export interface ConversationInput {
  rawText: string;
  fileName?: string;
  fileSize?: string;
  sourceType: 'paste' | 'upload' | 'extension-page';
  isSamplePreview?: boolean;
}
