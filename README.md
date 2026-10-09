# MISSED.

> **Catch what matters. Verify every insight.**

MISSED. is an AI-powered micro-app built for the ProtocolX Hackathon to solve **The Unread Problem**: helping users quickly understand, prioritize, and verify critical information from overwhelming chat conversations.

---

## 1. Project Overview

Modern messaging channels (WhatsApp, Slack, Telegram, Discord) generate overwhelming chat volume. Critical requests, explicit deadlines, strategic decisions, and unanswered questions are easily buried under casual chatter.

MISSED. provides an evidence-first, neo-brutalist workspace that extracts what matters and links every insight back to verifiable source messages.

---

## 2. Implemented vs. Planned Features

### Frontend Website UI (Implemented & Verified)
- **Import Screen:**
  - Drag-and-drop chat export upload.
  - Browse file button with `.txt` validation.
  - Paste text area with character counter.
  - Real-time input validation, empty states, and feedback notices.
  - Privacy disclosure banner.
- **Analysis Progress Screen:**
  - 5 evidence-first stages: *Preparing Conversation*, *Reading the Conversation*, *Finding the Signal*, *Building Your Catch-Up*, *Verifying the Evidence*.
  - Explicit pending, active, completed, failed, and unavailable states.
  - Return to Import and Cancel actions.
- **Results Dashboard:**
  - Conversation summary with participant metrics.
  - Expandable **Attention Radar** (`ACT NOW`, `RESPONSE NEEDED`, `KEEP IN MIND`).
  - Extracted findings list with urgency sorting.
  - Action items with explicit deadline indicators.
  - Confirmed decisions and agreements.
  - Potentially unanswered questions.
  - Search and filter controls.
  - Clear / Delete imported data action.
- **Evidence Explorer:**
  - Interactive drawer displaying original message excerpt, sender, timestamp, and basis (*fact* vs. *interpretation*).
  - Explicit evidence-unavailable states when citations cannot be verified.
- **Design Preview Mode:**
  - Opt-in `DESIGN PREVIEW — SAMPLE DATA` toggle allowing full UI review with illustrative data.
  - Production mode transparently indicates `ENGINE UNAVAILABLE` with zero synthetic data.

### Chrome Extension UI (Implemented & Verified)
- **Extension Suite (`frontend/src/Extension.tsx`):**
  - **Popup:** Toolbar action view with *Upload Chat*, *Use Current Page*, and *Open Full Analysis* actions.
  - **Side Panel:** Chatbot-style assistant with context status, sample questions, and citation badges (`[1]`, `[2]`).
  - **Evidence Drawer:** Slide-over source inspection for citation verification.
  - **Local Handoff:** Token-based handoff modal for launching the web workspace securely.

### Backend Service & Parser (Implemented)
- Loopback Node.js service bound securely to `127.0.0.1:3001` for guaranteed local processing.
- REST API exposing `GET /api/health`, `POST /api/analyze`, `POST /api/chat`.
- Deterministic NLP parser (`src/core/parser.ts`) for WhatsApp iOS/Android exports, supporting multiline extraction and robust stable IDs.
- Strict input runtime validation using `Zod`.
- Modular AI provider architecture (`AIProvider`).
- Ollama local model integration (`http://127.0.0.1:11434`) configured to safely detect availability without fabricating responses.

### Planned for Next Phase (Extension)
- Extension Manifest V3 background scripts and content extraction.
- End-to-End LLM prompt refinement for rigorous JSON schema compliance.
---

## 3. Current Folder Structure

```
MISSED/
├── frontend/                     # React 19 + Tailwind v4 + Vite web application
│   ├── src/
│   │   ├── App.tsx               # Website UI (Import, Progress, Dashboard, Evidence)
│   │   ├── Extension.tsx         # Chrome Extension UI (Popup, Side Panel, Handoff)
│   │   ├── index.css             # Tailwind v4 & Amber Walnut Morning design tokens
│   │   ├── main.tsx              # React entry point
│   │   ├── vite-env.d.ts         # Environment types
│   │   └── services/
│   │       └── analysisService.ts# Analysis service interface implementation
│   ├── public/
│   ├── index.html                # HTML entry
│   ├── package.json              # Frontend dependencies
│   ├── tsconfig.json             # TypeScript paths configuration
│   └── vite.config.ts            # Vite configuration
│
├── backend/                      # Node.js Express backend service
│   ├── src/
│   │   ├── core/                 # Conversation parsing logic
│   │   ├── routes/               # API routes (analysis)
│   │   ├── services/             # AI Provider implementations (Ollama)
│   │   └── index.ts              # Express server entry
│   ├── package.json              # Backend dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   └── README.md                 # Backend architecture and specs
│
├── extension/
│   └── README.md                 # Chrome extension Manifest V3 roadmap and handoff specs
│
├── shared/
│   └── src/
│       ├── types/
│       │   └── index.ts          # Shared TypeScript domain contracts
│       └── contracts/
│           └── analysis.ts       # Analysis service interface
│
├── tests/                        # Test suite directory
├── package.json                  # Root delegate scripts
├── .gitignore                    # Git ignore configuration
├── .env.example                  # Environment configuration template
├── prompt.md                     # Permanent AI development log
└── README.md                     # Project documentation
```

---

## 4. Setup & Running Instructions

### Prerequisites
- Node.js `v18+` (Tested on `v25.9.0`)
- npm `v9+` (Tested on `11.12.1`)

### Quick Start
```bash
# Install frontend dependencies
npm --prefix frontend install

# Start development server
npm run dev
# Or from frontend folder:
# cd frontend && npm run dev

# Run production build check
npm run build
```

---

## 5. Design System

- **Palette:** Amber Walnut Morning
  - Burnt amber: `#B96B43`
  - Dark walnut: `#4A403B`
  - Mist: `#EBF0EF`
  - Warm clay: `#C98F70`
  - Sand: `#CCB499`
  - Deep ink: `#211C19`
  - Warm off-white: `#F7F5F0`
- **Typography:** Display: `Space Grotesk`, Body: `DM Sans`
- **Styling:** Thick solid borders (2px), hard offset drop shadows (`5px 5px 0 #211C19`), responsive desktop & mobile layouts.

---

## 6. Privacy & Current Limitations

- **Current Status:** Frontend integration is complete. The Backend API is implemented locally and the frontend connects to it.
- **Privacy Guarantee:** All current operations run 100% on the local machine (`localhost`). No network requests are made to remote cloud providers (using local Ollama if available).
- **Preview Behavior:** If the local AI provider is unavailable, the system safely reports `ENGINE UNAVAILABLE`. Only the opt-in *Design Preview* mode displays illustrative mock data.
