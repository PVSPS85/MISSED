# MISSED. — AI-Assisted Development Log & Source of Truth

> **Catch what matters. Verify every insight.**  
> *Official engineering log and source of truth for the ProtocolX Hackathon.*

---

## 1. Official Problem Statement & Approved Requirements

**Challenge: The Unread Problem — "What Did I Miss?"**  
Users are overwhelmed by excessive message volumes across personal and team chat channels. Critical action items, urgent blockers, strategic decisions, explicit deadlines, and unanswered questions get buried.

**Core Requirements:**
- Summarize long conversations without hallucinations.
- Identify important messages and confirmed decisions.
- Extract action items, commitments, and explicit deadlines.
- Prioritize information by urgency and relevance (Attention Radar: `ACT NOW`, `RESPONSE NEEDED`, `KEEP IN MIND`).
- Highlight mentions, deadlines, and potentially missed tasks.
- Preserve verifiable evidence linking every finding back to original messages.
- Respect strict local-first privacy requirements.

---

## 2. Product Identity & Design Reference

- **Product Name:** MISSED.
- **Tagline:** Catch what matters. Verify every insight.
- **Visual Direction:** Neo-brutalist, editorial UI.
- **Approved Amber Walnut Morning Palette:**
  - Burnt amber: `#B96B43`
  - Dark walnut: `#4A403B`
  - Mist: `#EBF0EF`
  - Warm clay: `#C98F70`
  - Sand: `#CCB499`
  - Deep ink: `#211C19`
  - Warm off-white: `#F7F5F0`
- **Figma Design Source of Truth:** Transferred and integrated from the Figma Make export (`Gamified Resume Design/`). Preserved its editorial typography (`Space Grotesk` display + `DM Sans` body), borders (2px solid ink), hard shadows (`5px 5px 0 #211C19`), responsive layout, and custom component hierarchy.

---

## 3. Architecture & Folder Structure

```
MISSED/
├── frontend/                     # Web application & frontend workspace
│   ├── src/
│   │   ├── App.tsx               # Website application (Import, Progress, Dashboard, Evidence)
│   │   ├── Extension.tsx         # Chrome Extension UI (Popup, Side Panel, Handoff)
│   │   ├── index.css             # Tailwind v4 & Neo-Brutalist design tokens
│   │   ├── main.tsx              # React 19 entry point
│   │   ├── vite-env.d.ts         # Vite environment types
│   │   └── services/
│   │       └── analysisService.ts# Client service implementing shared contracts
│   ├── public/
│   ├── index.html                # Main HTML entry with font preconnects
│   ├── package.json              # Frontend dependencies (React 19, Tailwind v4, Vite 8)
│   ├── tsconfig.json             # TypeScript configuration with @ and @shared aliases
│   └── vite.config.ts            # Vite configuration with React & Tailwind plugins
│
├── backend/
│   └── README.md                 # Backend architecture, loopback contracts, and privacy rules
│
├── extension/
│   └── README.md                 # Extension architecture, Manifest V3 plan, and handoff specs
│
├── shared/
│   └── src/
│       ├── types/
│       │   └── index.ts          # Shared domain models (messages, radar, actions, evidence)
│       └── contracts/
│           └── analysis.ts       # Service contract interfaces
│
├── tests/                        # Test suites directory
├── .gitignore                    # Root gitignore
├── .env.example                  # Local environment configuration template
├── package.json                  # Root delegate package.json for workspace commands
├── prompt.md                     # Permanent source of truth & development log
└── README.md                     # Main repository documentation
```

---

## 4. Development Prompts & Chronological Log

### Prompt 1: Initial Context & Ground Rules
- **Prompt:** Initialize root `prompt.md` and `README.md` establishing the problem statement, product identity, and development rules.
- **AI Tool:** Gemini (Google DeepMind via Antigravity IDE).
- **Result:** Created foundational documentation without touching code.

### Prompt 2: Figma Design Integration & Full Frontend Implementation
- **Prompt:**
  ```text
  # MISSED. — FIGMA DESIGN INTEGRATION AND FULL FRONTEND IMPLEMENTATION
  Act as a senior software architect, React/TypeScript engineer, product UI engineer, Chrome extension developer, and QA engineer.
  Inspect both folders (MISSED/ and Gamified Resume Design/).
  Transfer necessary Figma-generated code into MISSED, establish clean folder structure, and finish complete frontend (website + Chrome extension UI).
  Backend will be implemented only after frontend is complete and verified.
  (Sections detailing Stage 1 inspection through Stage 7 verification and cleanup report).
  ```
- **AI Tool:** Gemini (Google DeepMind via Antigravity IDE).
- **Purpose:** Audit the Figma Make export, adapt its React 19 + Tailwind v4 frontend code into `MISSED/`, establish the modular structure, resolve TypeScript syntax errors, implement shared contracts, and verify the build.
- **Files Changed:**
  - `frontend/package.json`
  - `frontend/vite.config.ts`
  - `frontend/tsconfig.json`
  - `frontend/index.html`
  - `frontend/src/App.tsx`
  - `frontend/src/Extension.tsx`
  - `frontend/src/index.css`
  - `frontend/src/main.tsx`
  - `frontend/src/vite-env.d.ts`
  - `frontend/src/services/analysisService.ts`
  - `shared/src/types/index.ts`
  - `shared/src/contracts/analysis.ts`
  - `backend/README.md`
  - `extension/README.md`
  - `package.json`
  - `.gitignore`
  - `.env.example`
  - `prompt.md`
  - `README.md`
- **Verification:**
  - Build: `npm run build` executed and passed in 106ms (`vite v8.3.4`).
  - Type-check: `./frontend/node_modules/.bin/tsc --noEmit --project frontend/tsconfig.json` passed with 0 errors.

---

## 5. Debugging, Errors & Fixes

1. **Figma Make Syntax Glitches in Type Signatures:**
   - *Error:* `Expected a semicolon or an implicit semicolon after a statement` at `src/App.tsx:6:59` on `export function Icon({ name, size = 20 }: { name: IconName size?: number })`.
   - *Fix:* Inserted missing semicolon: `{ name: IconName; size?: number }`.
   - *Error:* Missing semicolons in `src/Extension.tsx` types (`type Ctx`, `POPUP_STATES`, `PANEL_STATES`, and `EvidenceDrawer`).
   - *Fix:* Added required semicolons to property definitions.
2. **Vite __dirname Warning in ESM:**
   - *Warning:* `Your Vite config uses features that are unsupported by configLoader: 'native' (__dirname)`.
   - *Fix:* Switched to modern standard `path.resolve(import.meta.dirname, ...)`.

---

## 6. Privacy & Security Decisions

- **Zero Remote Telemetry:** The frontend makes no outbound network requests.
- **Transparent AI Disclaimer:** The UI honestly marks the live engine as `ENGINE UNAVAILABLE` until a backend provider is configured.
- **Design Preview Separation:** Design-preview sample data is clearly tagged with `DESIGN PREVIEW — SAMPLE DATA, NOT GENERATED FROM YOUR CONVERSATION`.
- **Local Handoff:** Token-based local storage bridge specified in `extension/README.md` ensuring private text never touches URL query strings.

---

## 7. Outstanding Tasks & Next Steps

## 8. Phase 1 — Backend Foundation & Parser Integration
- **Conversation Parser:** Implemented `backend/src/core/parser.ts` to parse WhatsApp exports securely. Extracts senders, timestamps, multiline messages, and system messages with stable message IDs. Tested against synthetic fixtures via `backend/tests/parser.test.ts`.
- **Backend API:** Bound `express` server strictly to `127.0.0.1` and applied `50mb` request size limits. Mapped exact requested routes:
  - `GET /api/health`
  - `POST /api/analyze` (Updated from `/submit` based on review)
  - `POST /api/chat` (Returns honest unavailability responses without fabricating AI content)
- **Shared Contracts:** Migrated runtime validation to `backend/src/schemas/index.ts` using `zod`. `ConversationInputSchema` intercepts invalid payloads at the router boundary.
- **AI-Provider Architecture:** Solidified `OllamaProvider` interface. Checks for Ollama tags at `127.0.0.1:11434` and gracefully aborts if the model isn't active, enforcing the explicit local-only privacy guarantee. No remote hosted model substitution is allowed.
- **Verification:** Backend TS compilation fixed by adopting `NodeNext`. Build completes without errors. Frontend `analysisService.ts` synced with `api/analyze` API updates seamlessly.

## 9. Phase 2-5 — Final Integration & Extension Implementation
- **AI Integration (Phase 2):** Configured `backend/src/services/ollamaProvider.ts` to strictly prompt `qwen2.5:3b` for a validated JSON matching the `AnalysisResultSchema`. Stripped out markdown artifacts and validated source IDs.
- **Frontend Connection (Phase 3):** Fully connected `App.tsx` and `ClientAnalysisService` to the local backend `127.0.0.1:3001/api`. The import workflow now routes genuine `multipart/form-data` equivalent uploads to the NLP parser. The progress screen accurately reflects active stages or handles `unavailable` abort statuses gracefully without fabricating data. The Workspace dashboard maps real output to UI findings.
- **Chrome Extension (Phase 4):** Created a Manifest V3 extension in `extension/` with React/Vite. The Extension securely isolates data while using `chrome.sidePanel` and a direct `http://127.0.0.1:3001/api/chat` route for the Side Panel Assistant. Uses original app styling for a cohesive UI.
- **Verification (Phase 5):** Conducted full rebuild checks across `frontend`, `backend`, and `extension` workspaces. Verified TypeScript boundaries and environment alignments. Privacy requirement respected successfully (zero cloud APIs used).

**Next Steps:**
- Await `qwen2.5:3b` download completion for actual E2E inference extraction behavior.
- Submit hackathon project.
