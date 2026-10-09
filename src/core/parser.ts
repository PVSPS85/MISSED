/**
 * MISSED. — Conversation Parser
 * Handles WhatsApp (iOS, Android), Slack exports, and plain multiline transcripts.
 * Preserves stable message IDs and exact source lines for the Evidence Explorer.
 */

import { NormalizedMessage, ParseResult } from './types';

// Regex patterns for various WhatsApp date-time header formats
// 1. iOS bracket format: [12/10/24, 10:14:22 AM] or [12/10/2024, 10:14:22]
const IOS_REGEX = /^\[(\d{1,4}[-/.]\d{1,2}[-/.]\d{2,4}(?:,\s*|\s+)\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\]\s*(.*)$/;

// 2. Android dash format: 12/10/2024, 10:14 - Sender: Message or 12/10/24, 10:14 am - Sender: Message
const ANDROID_REGEX = /^(\d{1,4}[-/.]\d{1,2}[-/.]\d{2,4}(?:,\s*|\s+)\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\s*[-~–—]\s*(.*)$/;

// 3. Simple bracket timestamp: [10:14 AM] Sender: Message or [10:14] Sender: Message
const SIMPLE_TIME_REGEX = /^\[(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\]\s*(.*)$/;

// System message indicators
const SYSTEM_PHRASES = [
  'messages and calls are end-to-end encrypted',
  'created group',
  'added',
  'removed',
  'left',
  'changed the group description',
  'changed the subject to',
  'changed the group icon',
  'security code changed',
  'you were added',
  'joined using this group\'s invite link',
  'message was deleted',
  'this message was deleted'
];

/**
 * Cleans zero-width characters and unusual whitespace common in mobile exports
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[\u200E\u200F\u202A-\u202E\uFEFF]/g, '') // bidirectional & zero-width marks
    .replace(/\u202F|\u00A0/g, ' ') // narrow no-break space / non-breaking space
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

/**
 * Checks if a body without an explicit sender pattern is a system notification
 */
function isSystemMessage(content: string): boolean {
  const lower = content.toLowerCase();
  return SYSTEM_PHRASES.some(phrase => lower.includes(phrase));
}

/**
 * Parses raw conversation text into normalized messages.
 */
export function parseConversation(rawInput: string): ParseResult {
  const sanitized = sanitizeText(rawInput || '');
  const lines = sanitized.split('\n');

  const messages: NormalizedMessage[] = [];
  const parseWarnings: string[] = [];
  let formatDetected = 'Unknown / Plain Transcript';
  let messageCounter = 0;

  let currentMsg: NormalizedMessage | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed && !currentMsg) {
      continue; // Skip leading empty lines
    }

    let timestamp = '';
    let remainder = '';
    let matchedFormat: 'ios' | 'android' | 'simple' | null = null;

    const iosMatch = line.match(IOS_REGEX);
    if (iosMatch) {
      matchedFormat = 'ios';
      timestamp = iosMatch[1].trim();
      remainder = iosMatch[2].trim();
      if (formatDetected === 'Unknown / Plain Transcript') {
        formatDetected = 'WhatsApp (iOS Format)';
      }
    } else {
      const androidMatch = line.match(ANDROID_REGEX);
      if (androidMatch) {
        matchedFormat = 'android';
        timestamp = androidMatch[1].trim();
        remainder = androidMatch[2].trim();
        if (formatDetected === 'Unknown / Plain Transcript') {
          formatDetected = 'WhatsApp (Android Format)';
        }
      } else {
        const simpleMatch = line.match(SIMPLE_TIME_REGEX);
        if (simpleMatch) {
          matchedFormat = 'simple';
          timestamp = simpleMatch[1].trim();
          remainder = simpleMatch[2].trim();
          if (formatDetected === 'Unknown / Plain Transcript') {
            formatDetected = 'Transcript with Timestamps';
          }
        }
      }
    }

    if (matchedFormat) {
      // If we had a message in progress, push it
      if (currentMsg) {
        messages.push(currentMsg);
        currentMsg = null;
      }

      // Check if remainder has "Sender: Message"
      // Note: Sender can have spaces or characters, but is delimited by the first ": "
      const colonIndex = remainder.indexOf(': ');
      let sender = 'System';
      let text = remainder;
      let isSystem = false;

      if (colonIndex !== -1) {
        sender = remainder.substring(0, colonIndex).trim();
        text = remainder.substring(colonIndex + 2).trim();
        // Check if sender itself looks like a system note
        if (isSystemMessage(sender) || isSystemMessage(text)) {
          isSystem = isSystemMessage(text) && colonIndex === -1;
        }
      } else {
        // No colon found, likely a system message (e.g., "[10:14] Alice created group...")
        isSystem = true;
        sender = 'System';
        text = remainder;
      }

      messageCounter++;
      currentMsg = {
        id: `msg-${messageCounter}`,
        index: i,
        raw: line,
        sender,
        timestamp,
        timestampRaw: timestamp,
        text,
        isSystem
      };
    } else {
      // This line does not start with a recognized timestamp header
      if (currentMsg) {
        // Multiline continuation of previous message
        currentMsg.text += '\n' + line;
        currentMsg.raw += '\n' + line;
      } else {
        // Plain text transcript fallback: e.g. "Alice: Hey there" or line-by-line notes
        const colonIndex = line.indexOf(': ');
        if (colonIndex > 0 && colonIndex < 40) {
          const sender = line.substring(0, colonIndex).trim();
          const text = line.substring(colonIndex + 2).trim();
          messageCounter++;
          currentMsg = {
            id: `msg-${messageCounter}`,
            index: i,
            raw: line,
            sender,
            timestamp: `Line ${i + 1}`,
            text,
            isSystem: isSystemMessage(text)
          };
        } else if (trimmed) {
          // Unstructured plain message line
          messageCounter++;
          currentMsg = {
            id: `msg-${messageCounter}`,
            index: i,
            raw: line,
            sender: 'Unknown',
            timestamp: `Line ${i + 1}`,
            text: trimmed,
            isSystem: isSystemMessage(trimmed)
          };
        }
      }
    }
  }

  // Push final message if pending
  if (currentMsg) {
    messages.push(currentMsg);
  }

  if (messages.length === 0 && sanitized.trim().length > 0) {
    parseWarnings.push('Could not detect distinct messages. The text was treated as a single body.');
    messages.push({
      id: 'msg-1',
      index: 0,
      raw: sanitized,
      sender: 'Speaker',
      timestamp: 'Unknown',
      text: sanitized.trim(),
      isSystem: false
    });
  }

  return {
    success: messages.length > 0,
    messages,
    formatDetected,
    parseWarnings,
    rawLineCount: lines.length
  };
}
