# MISSED. — Backend Service Architecture

## Responsibilities & Future Scope

The backend service is responsible for:
1. Local conversation parsing and normalization.
2. Interfacing with the configured AI provider (e.g. local Ollama at `http://127.0.0.1:11434` or an approved local/remote provider).
3. Structured output validation and schema compliance.
4. Deterministic fallback processing when AI is unavailable.
5. Local data persistence (e.g. IndexedDB on the client) and explicit local data deletion.

## Planned API Contracts

- `GET /api/health` — Check server health and AI provider connectivity.
- `POST /api/analyze` — Submit conversation text for parsing, Attention Radar generation, and evidence extraction.
- `POST /api/chat` — Context-bound Q&A scoped strictly to the submitted conversation.
- `POST /api/handoff` — Secure local handoff token generation (keeping conversation data out of URLs).
- `GET /api/handoff/:id` — Retrieve handoff payload with immediate expiration.

## Important Privacy Constraint

The ProtocolX hackathon brief states that conversations, data, and summaries must remain on the user's device. 
- Transmitting conversation text to remote cloud AI services conflicts with this constraint unless explicitly authorized by the organizers.
- The service must bind to loopback (`127.0.0.1`) only.
- Never falsely claim local processing if remote inference is used.

*Status: Implementation will begin in the backend phase after frontend verification.*
