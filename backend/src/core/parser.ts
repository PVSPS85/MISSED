export function parseConversation(text: string): string {
  // Simple normalization: trim and limit length to avoid overwhelming local models
  const trimmed = text.trim();
  // Basic heuristic: if it looks like a WhatsApp or Slack export, we could do more parsing.
  // For MVP, we just ensure it's not too long and is basic text.
  
  if (trimmed.length === 0) {
    throw new Error('Conversation text is empty.');
  }

  return trimmed;
}
