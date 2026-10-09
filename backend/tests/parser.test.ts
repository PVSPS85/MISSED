import { parseConversation } from './src/core/parser.js';

const syntheticData = `
[12/10/23, 14:32:01] Alice: Hey Bob, are we still meeting tomorrow?
[12/10/23, 14:35:12] Bob: Yes, 10 AM at the coffee shop.
[12/10/23, 14:35:15] Bob: Don't forget the documents.
[12/10/23, 14:36:00] Alice: I have them.
See you tomorrow!
[12/10/23, 14:40:00] System: Messages and calls are end-to-end encrypted.
`;

try {
  const result = parseConversation(syntheticData);
  console.log('Parser Test Result:', JSON.stringify(result, null, 2));
} catch (e) {
  console.error('Parser Test Failed:', e);
}
