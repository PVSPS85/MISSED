# MISSED. — Chrome Extension (Manifest V3)

## Architecture & Responsibilities

The MISSED. Chrome Extension provides two primary companion interfaces:
1. **Extension Action Popup:** Quick-action launcher for uploading exported chats, selecting page context, and navigating to the full analysis experience.
2. **Side Panel Assistant:** Persistent side panel providing context-bound question answering, source citations, and evidence inspection against the provided conversation.

## Component Design (From Figma Source)

The extension UI is implemented in `frontend/src/Extension.tsx` and mirrors the Amber Walnut Morning neo-brutalist identity:
- **Surfaces:**
  - `Popup`: Compact 340px toolbar action view.
  - `Panel`: 400px persistent side panel with conversation-grounded assistant, citation tags (`[1]`, `[2]`), and expandable evidence drawer.
  - `Handoff`: Private token-based handoff modal for opening the full analysis dashboard without exposing conversation text in URLs.
- **States:**
  - Initial (no context)
  - Context ready (file or page text loaded)
  - Question submitted / responding (indeterminate activity)
  - Answer with verifiable source citations
  - Evidence detail drawer (original text, basis: fact vs. interpretation)
  - Unavailable / restricted page states

## Build & Integration Roadmap (Phase 2)

- Standalone extension bundle using Manifest V3 (`manifest.json`, `background.ts`, `content.ts`).
- Secure local handoff via `chrome.storage.local` or loopback backend token.
- Shared domain types imported from `@shared/types`.

*Note: The extension does not claim to intercept or scrape live WhatsApp Web chats automatically. Uploaded exports or user-approved text are the primary entry vectors.*
