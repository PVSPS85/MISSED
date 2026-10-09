import { parseConversation } from './src/core/parser.js';
import { OllamaProvider } from './src/services/ollamaProvider.js';

async function test() {
  const provider = new OllamaProvider();
  console.log('Available:', await provider.isAvailable());
  const synth = `
[10:00 AM] Alice: Let's launch the new website on Friday.
[10:05 AM] Bob: Sounds good, I will prepare the database by Thursday.
`;
  const res = await provider.chat('When is Bob preparing the database?', synth);
  console.log(res);
}

test().catch(console.error);
