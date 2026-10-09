# MISSED. — AI-Assisted Development Log
*Catch what matters. Verify every insight.*

---

## 1. Problem Statement
**Challenge: The Unread Problem — "What Did I Miss?"**
Users face overwhelming chat conversations across work and personal channels. Important action items, urgent requests, critical decisions, explicit deadlines, and unanswered questions get buried under hundreds of messages.
MISSED. is a local-first AI micro-app that rapidly parses, summarizes, prioritizes, and links every insight back to verifiable source evidence—guaranteeing that conversation data never leaves the user's device.

---

## 2. Product Identity and Core Features
- **Product Name:** MISSED.
- **Tagline:** Catch what matters. Verify every insight.
- **Visual Direction:** Neo-brutalist UI. Bold editorial typography, thick solid borders (2–3px), hard offset shadows (3–4px solid), purposeful whitespace, and zero generic AI dashboard styling.
- **Amber Walnut Morning Palette Tokens:**
  - Burnt Amber: `#B96B43`
  - Dark Walnut: `#4A403B`
  - Mist: `#EBF0EF`
  - Warm Clay: `#C98F70`
  - Sand: `#CCB499`
  - Deep Ink: `#211C19`
  - Warm Off-White: `#F7F5F0`

### Product Entry Points
1. **Website Application:**
   - Upload WhatsApp `.txt` exported conversation or paste raw conversation text.
   - Clear validation, real-time parsing status, error handling, and empty states.
   - Comprehensive analysis view with Attention Radar, Action Items, Evidence Explorer, and Decision Timeline.
   - Zero fake data, zero mock success screens, zero external API telemetry.
2. **Chrome Extension (Manifest V3):**
   - Action popup and dedicated side-panel assistant.
   - Conversation export upload and optional user-triggered "Use current page" readable content extraction via scoped content script.
   - Chat-style query interface scoped to provided context.
   - Private local-only handoff to the full analysis view (via `chrome.storage.local` or BroadcastChannel; strictly keeping conversation data out of URLs).
3. **Shared Analysis Engine:**
   - Unified parsing, normalization, priority evaluation, and evidence contract shared across Web and Extension.
   - Local-first execution (100% on-device).

### Feature Priority
- **P0 Required:**
  - Robust conversation parser (WhatsApp multiline, timestamps, senders, system messages, malformed lines).
  - Accurate conversation summary (distinguishing major topics from minor chatter without hallucinations).
  - Attention Radar:
    - `ACT NOW`: Urgent requests and explicit near-term deadlines.
    - `RESPONSE NEEDED`: Open questions and requests awaiting reply.
    - `KEEP IN MIND`: Important updates and decisions requiring no immediate action.
  - Action Items: Tasks, verified owners (only when supported by text), explicit deadlines vs ambiguous dates.
  - Evidence Explorer: Every claim, action item, decision, and deadline clickable to inspect verified source message (sender, timestamp, exact text).
  - Local-first Privacy: Hard requirement; no remote API transmissions, zero telemetry, local data deletion mechanism.
- **P1 Secondary (After P0):**
  - Decision Timeline (proposals, amendments, confirmed outcomes).
  - Unanswered-question analysis.
  - Local search and filtering across parsed messages and insights.
  - Extension context-aware page extraction.

---

## 3. Architecture and Technical Decisions
- **Stack:** React 19, TypeScript, Vite, Vitest for unit testing, Playwright for E2E testing.
- **Repository Structure:** Single coherent Vite project sharing:
  - `src/core/`: TypeScript types, WhatsApp parser, rule-based extractor, evidence linker, Ollama client.
  - `src/components/`: Reusable neo-brutalist UI components (tokens, cards, badges, radar, evidence modal).
  - `src/web/`: Web application entry point (`index.html`).
  - `src/extension/`: Chrome Extension MV3 components (`manifest.json`, `popup.html`, `sidepanel.html`, `background.ts`, `content.ts`).
- **Local AI Provider:**
  - Primary target: Ollama running locally at `http://127.0.0.1:11434`.
  - Detection: Dynamic model inspection (`/api/tags`), configurable model selection (e.g. `qwen2.5:3b`, `llama3.2`, etc.).
  - Transparency & Fallback: If Ollama is offline or model is missing, the application clearly states its status and executes deterministic, high-precision local rule-based analysis. Zero fake AI responses.
- **Privacy Architecture:**
  - All processing is on-device in browser memory / Web Worker / local Ollama API.
  - Extension handoff uses `chrome.storage.local` with unique session keys; no conversation contents passed in URLs or query strings.
  - Explicit "Delete Local Data" action clears storage and memory immediately.

---

## 4. Development Prompts — Chronological Log

### Prompt 1: Initial Setup
- **Prompt:**
  > We are building MISSED. for the ProtocolX hackathon. Before implementing the application, create a root-level file named `prompt.md`. This file is an important development artifact that documents our actual AI-assisted development process... (including requirements for structure, privacy, and non-fabrication).
- **Purpose:** Initialize the project's documentation artifact (`prompt.md`) to establish requirements, record the initial privacy constraint, and set up the development ledger.
- **Implementation Result:** Created root `prompt.md` with required sections.
- **Relevant Files Changed:** `prompt.md`
- **Tests Run / Results:** N/A
- **Remaining Issues:** Project implementation pending.

### Prompt 2: Master Project Instructions & Architectural Specification
- **Prompt:**
  > MISSED. — ProtocolX Master Project Instructions
  > Act as a senior full-stack engineer, Chrome extension developer, AI engineer, UI/UX designer, and software tester. You are building MISSED. for the ProtocolX hackathon. The development deadline is 3:00 PM, so prioritize a genuinely working, original product over unnecessary features... (Comprehensive spec for Web, Chrome Extension, Shared Engine, Amber Walnut Morning Neo-brutalist theme, Local Ollama integration, zero off-device data, 5 milestone git commits).
- **Purpose:** Formulate the complete technical architecture, inspect the workspace and git status, check local Ollama availability, define data contracts, and commence Stage 1 (Project setup & architecture).
- **Implementation Result:**
  - Inspected workspace: Clean git repository on branch `main` with 0 initial commits.
  - Verified Node version: `v25.9.0`, npm version: `11.12.1`.
  - Verified Ollama availability: Tested `curl -s http://127.0.0.1:11434/api/tags` and CLI check `which ollama`. Ollama is currently not running/installed on PATH.
  - Established dual-mode execution: High-performance local rule-based extractor as guaranteed baseline + dynamic Ollama connector when local server is available, with clear status UI.
  - Updated `prompt.md` with full product requirements, architecture, and milestone plan.
- **Relevant Files Changed:** `prompt.md`
- **Tests Run / Results:** `git status` (clean), `curl -s http://127.0.0.1:11434/api/tags` (offline).
- **Remaining Issues:** Ready to scaffold Vite React TypeScript application and configure dependencies.

---

## 5. Implementation Changes and Results
- Workspace verified (Node.js 25.9.0, npm 11.12.1).
- Initialized comprehensive `prompt.md` recording project objectives, design tokens, architecture, and development trajectory.

---

## 6. Errors, Debugging, and Fix Prompts
- **Issue:** Ollama is not currently detected at `http://127.0.0.1:11434`.
- **Resolution Strategy:** Built-in dual-engine design: deterministic rule-based NLP parser works 100% client-side with zero external dependencies, while the Ollama client provides optional local LLM enrichment when running. UI communicates exact status with zero fabrication.

---

## 7. API and AI Model Usage
- **Remote APIs:** NONE. Strictly 0 calls to external cloud APIs (no OpenAI, no Google Gemini cloud, no Anthropic, no hosted inference).
- **Local AI:**
  - Target: Ollama (`http://127.0.0.1:11434`)
  - Endpoints: `GET /api/tags` (model detection), `POST /api/chat` (local inference with structured schema).
  - Status: Currently offline. Transparent status will be shown in UI.

---

## 8. Testing and Verification
- **Automated Test Suite Planned:**
  - Parsing unit tests: WhatsApp exports (iOS 24h/12h brackets, Android dash formats, multiline messages, system notices, malformed input).
  - Analysis unit tests: Attention Radar categorization, deadline extraction, task owner attribution, evidence link validation.
  - Hand-off and storage deletion tests.
- **Verification Status:** Pending test suite implementation in Stage 2.

---

## 9. Privacy and Security Decisions
- **Absolute Local-First Rule:** Conversations, raw text, normalized messages, and analysis results remain on the user's device.
- **No Third-Party Analytics:** Zero tracking scripts, cookies, or external CDN dependencies.
- **Safe Chrome Extension Communication:** No conversation text passed in URL query parameters. Data handed off via `chrome.storage.local` with explicit user clearance controls.
- **Storage Management:** Single-click "Delete All Local Data" button that wipes IndexedDB/localStorage/sessionStorage completely.

---

## 10. Known Limitations and Final Status
- **Current Limitations:** Application scaffolding starting in Stage 1. Ollama server offline on host machine; local rule-based analysis will serve as primary offline engine.
- **Current Status:** Stage 1 (Project Scaffolding & Architecture) underway.
