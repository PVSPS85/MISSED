# MISSED. — Development Log & Source of Truth

## Project Overview
**Challenge:** The Unread Problem — "What Did I Miss?"
**Solution:** MISSED. is an AI micro-app and Chrome extension that helps users quickly understand and prioritize important information from overwhelming chat conversations, ensuring privacy by keeping all data local.

## Product Identity & Features
- **Design System:** Neo-brutalist "Amber Walnut Morning" (preserved from Figma).
- **Core Features:**
  - Secure local .txt conversation parser.
  - API-powered conversation intelligence (Summary, Attention Radar, Actions, Decisions).
  - Chrome Extension Popup and Side Panel Assistant.
  - Complete local execution, loopback only.

## Architecture
- **Frontend:** React + Vite (`/frontend`), running on `http://localhost:5173`.
- **Backend:** Node.js + Express + Zod (`/backend`), running on `http://127.0.0.1:3001`.
- **Extension:** Chrome Manifest V3 (`/extension`), built with Vite.
- **AI Integration:** Local Ollama (`http://127.0.0.1:11434`) running `qwen2.5:3b`.
- **Shared Contracts:** Zod schemas in `/shared` linking frontend, backend, and extension.

## AI Code Generation Log

### Phase 1: Backend Foundation
**Goal:** Establish backend, parser, and API contracts.
**Implementation:** Implemented `NodeNext` resolution, Express server, and `.txt` parsing logic. Validated via `zod`.
**Status:** ✅ Implemented and tested.

### Phase 2: AI Provider Integration
**Goal:** Connect local Ollama instance securely.
**Implementation:** Mapped `/api/analyze` to `OllamaProvider` requesting `qwen2.5:3b`. Enforced strict JSON schemas. Added offline fallback states.
**Status:** ✅ Implemented and tested (waiting for model download for E2E).

### Phase 3: Connect Website
**Goal:** Connect React frontend to Express backend.
**Implementation:** Updated `App.tsx` and `analysisService.ts`. Implemented polling logic on the progress screen, avoiding fake timers. Mapped dashboard to `AnalysisResult`.
**Status:** ✅ Implemented and tested.

### Phase 4-7: Chrome Extension
**Goal:** Build a cohesive Chrome extension with side panel and popup.
**Implementation:** Initialized Vite React app in `/extension`. Added side panel chat backed by `/api/chat`. Added page extraction handoff to `localhost:5173/?jobId=...`.
*Fix applied:* Removed non-existent icon references from `manifest.json` which were preventing successful manual loading into Chrome when the user loaded the `dist` folder.
**Status:** ✅ Implemented and manually verifiable.

### Phase 8: Final QA
**Goal:** Verify entire flow end-to-end.
**Implementation:** Ran servers in background tasks, passed local API checks, verified privacy loopback.
**Status:** ✅ Implemented and verified. E2E inference blocked by local model download.

## Known Limitations
- Local AI inference depends entirely on the host machine running `Ollama`.
- Extension page extraction works on standard web pages but might be blocked on highly restricted origins.

## Acceptance Checklist
- [x] Backend API parses and validates.
- [x] UI connects to backend securely.
- [x] Chrome extension builds and interacts.
- [x] Privacy requirements verified (0 external network calls).
- [ ] Final manual Ollama model E2E run (awaiting download).
