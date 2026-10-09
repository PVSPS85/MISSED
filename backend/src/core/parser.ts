import { v4 as uuidv4 } from 'uuid';
import { SourceMessage } from '@shared/types/index.js';

/**
 * Parses a raw WhatsApp-style text export into structured SourceMessages.
 */
export function parseConversation(text: string): SourceMessage[] {
  if (!text || text.trim().length === 0) {
    throw new Error('Conversation text is empty.');
  }

  const lines = text.split('\n');
  const messages: SourceMessage[] = [];
  
  // Regex to match common WhatsApp timestamp formats:
  // Format 1: [DD/MM/YY, HH:MM:SS] Sender: Message
  // Format 2: DD/MM/YY, HH:MM - Sender: Message
  // Format 3: M/D/YY, HH:MM AM/PM - Sender: Message
  // We use a flexible regex that extracts the timestamp block and the sender block if available.
  const regex = /^\[?(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s+[aApP][mM])?)\]?[ -]+([^:]+):\s*(.*)$/;
  const systemRegex = /^\[?(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s+[aApP][mM])?)\]?[ -]+(.*)$/;
  // Format 4: [HH:MM AM, DD/MM/YYYY] Sender: Message (WhatsApp export format)
  const timeFirstRegex = /^\[?(\d{1,2}:\d{2}(?::\d{2})?\s*(?:[aApP][mM])?,?\s+\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4})\]?\s+([^:]+):\s*(.*)$/;

  let currentMsg: SourceMessage | null = null;
  let index = 0;

  for (const rawLine of lines) {
    const line = rawLine.trimRight();
    if (!line) continue;

    const match = line.match(regex) || line.match(timeFirstRegex);
    
    if (match) {
      // New message
      if (currentMsg) {
        messages.push(currentMsg);
      }
      
      const timestamp = match[1].trim();
      const sender = match[2].trim();
      const msgText = match[3];

      currentMsg = {
        id: uuidv4(),
        index: index++,
        raw: line,
        sender,
        timestamp,
        text: msgText,
        isSystem: false,
      };
    } else {
      // Could be a system message or a multiline continuation
      const sysMatch = line.match(systemRegex);
      if (sysMatch && !currentMsg) {
        // System message (e.g. "Messages and calls are end-to-end encrypted.")
        currentMsg = {
          id: uuidv4(),
          index: index++,
          raw: line,
          sender: 'System',
          timestamp: sysMatch[1].trim(),
          text: sysMatch[2],
          isSystem: true,
        };
      } else if (currentMsg) {
        // Continuation of the previous message
        currentMsg.text += '\n' + line;
        currentMsg.raw += '\n' + line;
      } else {
        // Fallback for malformed lines at the very beginning
        currentMsg = {
          id: uuidv4(),
          index: index++,
          raw: line,
          sender: 'Unknown',
          timestamp: 'Unknown',
          text: line,
          isSystem: false,
        };
      }
    }
  }

  if (currentMsg) {
    messages.push(currentMsg);
  }

  return messages;
}
