# MISSED. — Catch what matters. Verify every insight.

**Official Challenge:** The Unread Problem — "What Did I Miss?"

**The Problem:** Overwhelming chat conversations bury important decisions, deadlines, and action items, causing confusion and missed opportunities.
**Our Approach:** MISSED. is a local-first, privacy-respecting AI micro-app and Chrome extension that digests long conversational exports, prioritizes critical information, and provides verifiable evidence pointing directly to the source text.

## Features
- **Conversation Import and Parsing:** Securely reads WhatsApp-style `.txt` exports. *(Implemented)*
- **AI-Generated Conversation Summary:** Provides a high-level briefing of the chat. *(Implemented)*
- **Attention Radar:** Categorizes urgency into 'Act now', 'Response needed', and 'Keep in mind'. *(Implemented)*
- **Action Items and Deadlines:** Identifies tasks and due dates. *(Implemented)*
- **Decisions and Questions:** Highlights confirmed agreements and pending inquiries. *(Implemented)*
- **Source Evidence Validation:** Every finding points to the exact original message. *(Implemented)*
- **Chrome Extension:** Action popup and persistent side panel assistant. *(Implemented)*
- **Local AI Processing:** 100% on-device inference via Ollama. *(Implemented)*

## Technology Stack
- **Frontend:** React, Vite, TypeScript, custom CSS.
- **Backend:** Node.js, Express, TypeScript, Zod.
- **Extension:** Chrome Manifest V3, built via Vite.
- **AI:** Local Ollama (`qwen2.5:3b`).

## Project Structure
```
MISSED/
├── frontend/   # Vite React web app
├── backend/    # Node.js API and parser
├── extension/  # Chrome Extension V3
├── shared/     # Zod schemas and TypeScript types
├── prompt.md   # Chronological AI development log
└── README.md   # Project documentation
```

## Prerequisites and Setup
- Node.js (v18+)
- Ollama installed on macOS.
- `qwen2.5:3b` model downloaded via Ollama.

### 1. Install Dependencies
```bash
npm install --prefix frontend
npm install --prefix backend
npm install --prefix extension
```

### 2. Configure AI
Run the following to download the required local model:
```bash
ollama run qwen2.5:3b
```

### 3. Start the Backend
The backend runs on `127.0.0.1:3001` to enforce privacy.
```bash
npm run build --prefix backend
npm run start --prefix backend
```

### 4. Start the Frontend
The website development server runs on `http://localhost:5173`.
```bash
npm run dev --prefix frontend
```

### 5. Build the Extension
```bash
npm run build --prefix extension
```

### 6. Load Extension into Chrome
1. Open `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select the `MISSED/extension/dist` directory.
4. Pin the extension to your toolbar.

## API Reference
- `GET /api/health` - Checks backend and AI provider status.
- `POST /api/analyze` - Submit `{ rawText, sourceType }`, returns `{ jobId }`.
- `GET /api/status/:jobId` - Poll for processing status.
- `GET /api/result/:jobId` - Fetch the validated `AnalysisResult`.
- `POST /api/chat` - Query the side panel assistant with context.

## Privacy and Security
MISSED. is designed around a strictly local architecture. All analysis happens on your device using Ollama. The Node.js backend binds exclusively to `127.0.0.1`, and the Chrome extension communicates directly with this loopback interface. No private conversation data is ever sent to external cloud APIs or telemetry servers.

## Development Status
- **Implemented & Verified:** E2E web flow, parser logic, validation, API routing, Extension UI, and handoff mechanisms.
- **Blocked/Pending:** Real E2E inference validation depends on the local completion of the Ollama model download. The UI elegantly handles the "Service Unavailable" state in the interim without faking results.

## Demo Instructions
1. Ensure both frontend (`5173`) and backend (`3001`) are running.
2. Open `http://localhost:5173`.
3. Paste a synthetic chat (e.g. `[10:00] Alice: Hey, did we decide on the budget?`).
4. Click **Start Analysis**. 
5. If Ollama is running, the dashboard will render findings backed by source text. If Ollama is not ready, the app will gracefully report unavailability, preserving privacy and avoiding fabricated results.
6. Open the Chrome Extension to chat with the assistant or extract page content into the web app.
