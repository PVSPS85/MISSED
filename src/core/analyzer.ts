/**
 * MISSED. — Local-First Deterministic Analysis Engine
 * High-precision, zero-hallucination analysis running 100% on the user's device.
 * Extracts Attention Radar (ACT NOW, RESPONSE NEEDED, KEEP IN MIND), Action Items,
 * Decisions, and Evidence Links with rigorous verification.
 */

import {
  NormalizedMessage,
  AnalysisResult,
  RadarItem,
  ActionItem,
  DecisionItem,
  UnansweredQuestion,
  TopicSummary,
  ConversationSummary,
  DeadlineType
} from './types';

// Urgency patterns for ACT NOW
const URGENT_PATTERNS = [
  /\b(urgent|urgently|asap|immediately|critical|blocker|emergency|showstopper|p0)\b/i,
  /\b(needs? attention now|right now|do this now|stop what you're doing)\b/i,
  /\b(server is down|production broken|outage|data loss|security breach)\b/i,
  /\b(deadline is today|due today|by eod today|before 5\s*(?:pm)?|in the next \d+ hours?)\b/i
];

// Explicit deadline detection
const EXPLICIT_DEADLINE_PATTERNS = [
  /\b(?:by|before|due|deadline:?)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*(?:today|tomorrow|tonight|eod)?)/i,
  /\b(?:by|before|due|deadline:?)\s+((?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+morning|\s+afternoon|\s+eod)?)/i,
  /\b(?:by|before|due|deadline:?)\s+(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)/i,
  /\b(?:by|before|due|deadline:?)\s+(end of (?:day|today|the week)|eod|cob)\b/i
];

// Ambiguous deadline detection
const AMBIGUOUS_DEADLINE_PATTERNS = [
  /\b(?:by|due|sometime)\s+(next week|soon|later|in a few days|next sprint|eventually|when you get a chance|at some point)\b/i
];

// Task indicator patterns
const TASK_PATTERNS = [
  /\b(?:please|could you|can you|kindly)\s+([a-z\s]{4,60})/i,
  /\b(?:i will|i'll|will handle|taking care of|working on)\s+([a-z\s]{4,60})/i,
  /\b(?:todo:?|action item:?|need to|have to|must|assigned to)\s+([a-z\s]{4,60})/i
];

// Decision indicator patterns
const DECISION_PATTERNS = [
  /\b(?:we decided|decision:|agreed that|agreed on|let's go with|moving forward we will|approved|consensus is)\s+([^.\n]+)/i,
  /\b(?:final call:|plan is to|we will use|locked in)\s+([^.\n]+)/i
];

// Proposal patterns
const PROPOSAL_PATTERNS = [
  /\b(?:i propose|what if we|how about|should we|suggest that|thinking of)\s+([^.?\n]+)/i
];

/**
 * Extracts explicit or ambiguous deadlines from a text snippet
 */
function extractDeadline(text: string): { deadline: string | null; type: DeadlineType } {
  for (const pattern of EXPLICIT_DEADLINE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return { deadline: match[1].trim(), type: 'explicit' };
    }
  }

  for (const pattern of AMBIGUOUS_DEADLINE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return { deadline: match[1].trim(), type: 'ambiguous' };
    }
  }

  return { deadline: null, type: 'none' };
}

/**
 * Attempts to attribute task ownership without hallucination
 */
function attributeOwner(message: NormalizedMessage, taskText: string): {
  owner: string | null;
  confidence: 'explicit' | 'inferred' | 'unassigned';
} {
  const lower = taskText.toLowerCase();

  // First-person commitment ("I will...", "I'll take care of...")
  if (/\b(i will|i'll|i am on it|i'm on it|i can handle|assigned to me)\b/i.test(message.text)) {
    return { owner: message.sender, confidence: 'explicit' };
  }

  // Directed mention / tag: "@Bob please" or "Bob, can you"
  const directedMatch = message.text.match(/(?:@([A-Za-z0-9_-]+)|([A-Z][a-z]+)[,:]\s+(?:please|can you|could you))/);
  if (directedMatch) {
    const candidate = (directedMatch[1] || directedMatch[2]).trim();
    if (candidate && candidate.toLowerCase() !== 'all' && candidate.toLowerCase() !== 'everyone') {
      return { owner: candidate, confidence: 'explicit' };
    }
  }

  // "Assigned to [Name]"
  const assignMatch = message.text.match(/\b(?:assigned to|assign to)\s+([A-Z][a-z]+)/i);
  if (assignMatch) {
    return { owner: assignMatch[1].trim(), confidence: 'explicit' };
  }

  // General plea or unassigned request
  return { owner: null, confidence: 'unassigned' };
}

/**
 * Executes high-precision deterministic analysis over normalized messages
 */
export function analyzeConversationLocally(messages: NormalizedMessage[]): AnalysisResult {
  const nonSystemMsgs = messages.filter(m => !m.isSystem && m.text.trim().length > 0);
  const participantsSet = new Set<string>();
  
  nonSystemMsgs.forEach(m => {
    if (m.sender && m.sender !== 'System' && m.sender !== 'Unknown') {
      participantsSet.add(m.sender);
    }
  });

  const participants = Array.from(participantsSet);
  const actNowItems: RadarItem[] = [];
  const responseNeededItems: RadarItem[] = [];
  const keepInMindItems: RadarItem[] = [];
  const actionItems: ActionItem[] = [];
  const decisions: DecisionItem[] = [];
  const unansweredQuestions: UnansweredQuestion[] = [];

  let radarCount = 0;
  let actionCount = 0;
  let decisionCount = 0;
  let questionCount = 0;

  // Track answered questions by finding later replies that mention key question words
  const questionCandidates: { msg: NormalizedMessage; index: number; question: string }[] = [];

  for (let i = 0; i < nonSystemMsgs.length; i++) {
    const msg = nonSystemMsgs[i];
    const text = msg.text.trim();

    // 1. Check Urgency / ACT NOW
    const isUrgent = URGENT_PATTERNS.some(pat => pat.test(text));
    const deadlineInfo = extractDeadline(text);

    if (isUrgent || (deadlineInfo.type === 'explicit' && /\b(today|now|eod|asap)\b/i.test(text))) {
      radarCount++;
      const reason = isUrgent
        ? `Explicit urgency detected in message from ${msg.sender}: contains high-priority keywords.`
        : `Immediate deadline detected (${deadlineInfo.deadline}) requiring prompt action.`;

      actNowItems.push({
        id: `radar-act-${radarCount}`,
        category: 'ACT_NOW',
        title: text.length > 70 ? text.substring(0, 67) + '...' : text,
        description: text,
        reason,
        evidenceIds: [msg.id],
        snippet: text,
        sender: msg.sender,
        timestamp: msg.timestamp
      });
    }

    // 2. Check Action Items
    const hasTaskIntent = TASK_PATTERNS.some(pat => pat.test(text)) ||
      /\b(will send|will update|reviewing|to-do|action item|please send|please review)\b/i.test(text);

    if (hasTaskIntent) {
      actionCount++;
      const ownerInfo = attributeOwner(msg, text);
      const isPriorityUrgent = isUrgent || deadlineInfo.type === 'explicit';

      actionItems.push({
        id: `action-${actionCount}`,
        task: text.length > 90 ? text.substring(0, 87) + '...' : text,
        owner: ownerInfo.owner,
        ownerConfidence: ownerInfo.confidence,
        deadline: deadlineInfo.deadline,
        deadlineType: deadlineInfo.type,
        priority: isPriorityUrgent ? 'urgent' : deadlineInfo.type === 'ambiguous' ? 'high' : 'normal',
        evidenceIds: [msg.id],
        rawQuote: text,
        sender: msg.sender
      });
    }

    // 3. Check Questions / RESPONSE NEEDED
    const isQuestion = text.includes('?') ||
      /\b(can you|could anyone|does anyone know|who is|what is the status|waiting for|please confirm|any update on)\b/i.test(text);

    if (isQuestion) {
      questionCandidates.push({ msg, index: i, question: text });
    }

    // 4. Check Decisions / Proposals / KEEP IN MIND
    let decisionMatch: RegExpMatchArray | null = null;
    for (const pat of DECISION_PATTERNS) {
      decisionMatch = text.match(pat);
      if (decisionMatch) break;
    }

    if (decisionMatch) {
      decisionCount++;
      const decisionContent = decisionMatch[1]?.trim() || text;
      decisions.push({
        id: `decision-${decisionCount}`,
        topic: decisionContent.length > 60 ? decisionContent.substring(0, 57) + '...' : decisionContent,
        decision: text,
        status: 'confirmed',
        decisionMaker: msg.sender,
        evidenceIds: [msg.id],
        timestamp: msg.timestamp
      });

      radarCount++;
      keepInMindItems.push({
        id: `radar-keep-${radarCount}`,
        category: 'KEEP_IN_MIND',
        title: `Decision: ${decisionContent.length > 50 ? decisionContent.substring(0, 47) + '...' : decisionContent}`,
        description: text,
        reason: `Confirmed decision announced by ${msg.sender}.`,
        evidenceIds: [msg.id],
        snippet: text,
        sender: msg.sender,
        timestamp: msg.timestamp
      });
    } else {
      // Check proposals
      let proposalMatch: RegExpMatchArray | null = null;
      for (const pat of PROPOSAL_PATTERNS) {
        proposalMatch = text.match(pat);
        if (proposalMatch) break;
      }
      if (proposalMatch) {
        decisionCount++;
        const propContent = proposalMatch[1]?.trim() || text;
        decisions.push({
          id: `decision-${decisionCount}`,
          topic: propContent.length > 60 ? propContent.substring(0, 57) + '...' : propContent,
          decision: text,
          status: 'proposed',
          decisionMaker: msg.sender,
          evidenceIds: [msg.id],
          timestamp: msg.timestamp
        });

        radarCount++;
        keepInMindItems.push({
          id: `radar-keep-${radarCount}`,
          category: 'KEEP_IN_MIND',
          title: `Proposal: ${propContent.length > 50 ? propContent.substring(0, 47) + '...' : propContent}`,
          description: text,
          reason: `Proposal by ${msg.sender} for team consideration.`,
          evidenceIds: [msg.id],
          snippet: text,
          sender: msg.sender,
          timestamp: msg.timestamp
        });
      }
    }

    // General updates / announcements -> KEEP IN MIND
    if (/\b(fyi|heads up|update:|note:|remember that|announcement:)\b/i.test(text) && !isUrgent) {
      radarCount++;
      keepInMindItems.push({
        id: `radar-keep-${radarCount}`,
        category: 'KEEP_IN_MIND',
        title: text.length > 60 ? text.substring(0, 57) + '...' : text,
        description: text,
        reason: `Informational update from ${msg.sender} without immediate action requirements.`,
        evidenceIds: [msg.id],
        snippet: text,
        sender: msg.sender,
        timestamp: msg.timestamp
      });
    }
  }

  // Evaluate unanswered questions:
  // A question candidate is considered unanswered if it was asked near the end of the conversation
  // or if subsequent messages by other people do not directly address the query.
  for (const item of questionCandidates) {
    const isRecent = item.index >= Math.max(0, nonSystemMsgs.length - 4);
    // Check if there are answers afterwards
    const subsequentMsgs = nonSystemMsgs.slice(item.index + 1);
    const hasLikelyReply = subsequentMsgs.some(sm => 
      sm.sender !== item.msg.sender && 
      (sm.text.toLowerCase().includes('yes') || sm.text.toLowerCase().includes('no') || sm.text.toLowerCase().includes('done') || sm.text.toLowerCase().includes('fixed'))
    );

    if (isRecent || !hasLikelyReply) {
      questionCount++;
      unansweredQuestions.push({
        id: `question-${questionCount}`,
        question: item.question,
        askedBy: item.msg.sender,
        timestamp: item.msg.timestamp,
        evidenceIds: [item.msg.id]
      });

      radarCount++;
      responseNeededItems.push({
        id: `radar-resp-${radarCount}`,
        category: 'RESPONSE_NEEDED',
        title: item.question.length > 60 ? item.question.substring(0, 57) + '...' : item.question,
        description: item.question,
        reason: `Pending inquiry by ${item.msg.sender} awaiting confirmation or resolution.`,
        evidenceIds: [item.msg.id],
        snippet: item.question,
        sender: item.msg.sender,
        timestamp: item.msg.timestamp
      });
    }
  }

  // Major topics extraction
  const topics: TopicSummary[] = [];
  if (actNowItems.length > 0) {
    topics.push({
      topic: 'Urgent Priorities & Immediate Escalations',
      keyPoints: actNowItems.map(item => item.title),
      evidenceIds: actNowItems.flatMap(i => i.evidenceIds)
    });
  }
  if (actionItems.length > 0) {
    topics.push({
      topic: 'Team Action Items & Deliverables',
      keyPoints: actionItems.slice(0, 5).map(item => `${item.task} ${item.owner ? `(Owner: ${item.owner})` : ''} ${item.deadline ? `[Due: ${item.deadline}]` : ''}`.trim()),
      evidenceIds: actionItems.flatMap(i => i.evidenceIds)
    });
  }
  if (decisions.length > 0) {
    topics.push({
      topic: 'Key Decisions & Direction',
      keyPoints: decisions.map(d => `${d.status.toUpperCase()}: ${d.topic}`),
      evidenceIds: decisions.flatMap(d => d.evidenceIds)
    });
  }
  if (topics.length === 0 && nonSystemMsgs.length > 0) {
    topics.push({
      topic: 'General Discussion',
      keyPoints: [
        `Conversation between ${participants.join(', ') || 'participants'}.`,
        `${nonSystemMsgs.length} messages exchanged.`
      ],
      evidenceIds: nonSystemMsgs.slice(0, 3).map(m => m.id)
    });
  }

  // Timespan
  const timespan = {
    start: messages[0]?.timestamp,
    end: messages[messages.length - 1]?.timestamp
  };

  const summary: ConversationSummary = {
    overview: `Analyzed ${messages.length} messages across ${participants.length} participant(s). Identified ${actNowItems.length} urgent item(s), ${actionItems.length} action item(s), ${decisions.length} decision(s), and ${unansweredQuestions.length} pending question(s).`,
    majorTopics: topics,
    participants,
    totalMessages: messages.length,
    timespan
  };

  return {
    id: `analysis-${Date.now()}`,
    createdAt: new Date().toISOString(),
    engine: 'local-rules',
    engineNote: 'Deterministic Local Rule-Based Engine (100% on-device, zero data transmitted)',
    summary,
    radar: {
      actNow: actNowItems,
      responseNeeded: responseNeededItems,
      keepInMind: keepInMindItems
    },
    actionItems,
    decisions,
    unansweredQuestions,
    messages
  };
}
