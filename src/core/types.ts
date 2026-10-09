/**
 * MISSED. — Core Types & Contracts
 * Shared across Web Application, Chrome Extension, and Analysis Engine.
 * 100% Local-First: Never contains references to remote cloud services.
 */

export interface NormalizedMessage {
  id: string;
  index: number;
  raw: string;
  sender: string;
  timestamp: string;
  timestampRaw?: string;
  text: string;
  isSystem: boolean;
  replyToSnippet?: string;
}

export type RadarPriority = 'ACT_NOW' | 'RESPONSE_NEEDED' | 'KEEP_IN_MIND';

export interface RadarItem {
  id: string;
  category: RadarPriority;
  title: string;
  description: string;
  reason: string;
  evidenceIds: string[];
  snippet: string;
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
  sender?: string;
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
  possibleAssignee?: string;
}

export interface TopicSummary {
  topic: string;
  keyPoints: string[];
  evidenceIds: string[];
}

export interface ConversationSummary {
  overview: string;
  majorTopics: TopicSummary[];
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
  engine: 'local-rules' | 'ollama';
  modelUsed?: string;
  engineNote: string;
  summary: ConversationSummary;
  radar: {
    actNow: RadarItem[];
    responseNeeded: RadarItem[];
    keepInMind: RadarItem[];
  };
  actionItems: ActionItem[];
  decisions: DecisionItem[];
  unansweredQuestions: UnansweredQuestion[];
  messages: NormalizedMessage[];
}

export interface ParseResult {
  success: boolean;
  messages: NormalizedMessage[];
  formatDetected: string;
  parseWarnings: string[];
  rawLineCount: number;
}

export interface OllamaHealthStatus {
  isAvailable: boolean;
  version?: string;
  availableModels: string[];
  activeModel?: string;
  errorMessage?: string;
}
