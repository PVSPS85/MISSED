import { z } from 'zod';

export const ConversationInputSchema = z.object({
  rawText: z.string().min(1, 'Conversation text cannot be empty'),
  fileName: z.string().optional(),
  fileSize: z.string().optional(),
  sourceType: z.enum(['paste', 'upload', 'extension-page']),
  isSamplePreview: z.boolean().optional(),
});

export const RadarPrioritySchema = z.enum(['ACT_NOW', 'RESPONSE_NEEDED', 'KEEP_IN_MIND']);

export const RadarFindingSchema = z.object({
  id: z.string(),
  category: RadarPrioritySchema,
  title: z.string(),
  description: z.string(),
  reason: z.string(),
  evidenceIds: z.array(z.string()),
  sender: z.string().optional(),
  timestamp: z.string().optional(),
});

export const ActionItemSchema = z.object({
  id: z.string(),
  task: z.string(),
  owner: z.string().nullable(),
  ownerConfidence: z.enum(['explicit', 'inferred', 'unassigned']),
  deadline: z.string().nullable(),
  deadlineType: z.enum(['explicit', 'ambiguous', 'none']),
  priority: z.enum(['urgent', 'high', 'normal']),
  evidenceIds: z.array(z.string()),
  rawQuote: z.string(),
});

export const DecisionItemSchema = z.object({
  id: z.string(),
  topic: z.string(),
  decision: z.string(),
  status: z.enum(['confirmed', 'proposed', 'amended']),
  decisionMaker: z.string().optional(),
  evidenceIds: z.array(z.string()),
  timestamp: z.string().optional(),
});

export const UnansweredQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  askedBy: z.string(),
  timestamp: z.string().optional(),
  evidenceIds: z.array(z.string()),
});

export const AnalysisResultSchema = z.object({
  summary: z.object({
    overview: z.string(),
    majorTopics: z.array(
      z.object({
        topic: z.string(),
        points: z.array(z.string()),
        evidenceIds: z.array(z.string()),
      })
    ),
    participants: z.array(z.string()),
    totalMessages: z.number(),
    timespan: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }),
  }),
  radar: z.object({
    actNow: z.array(RadarFindingSchema),
    responseNeeded: z.array(RadarFindingSchema),
    keepInMind: z.array(RadarFindingSchema),
  }),
  actionItems: z.array(ActionItemSchema),
  decisions: z.array(DecisionItemSchema),
  unansweredQuestions: z.array(UnansweredQuestionSchema),
});
