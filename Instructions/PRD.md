# XR Recipe Generator MVP – PRD

## 1. Product Overview
- Build a browser-based assistant that converts handwritten or printed recipes into structured, scalable cooking guides.
- Provide chefs and home cooks with quick confirmation, scaling, and export tools that work across desktop, mobile, and WebXR experiences.
- Deliver the MVP on a PERN stack (Postgres, Express, React, Node) with OpenAI APIs powering hybrid OCR, parsing, and transcription flows.

## 2. Goals
- Enable a user to ingest a recipe image or audio note and confirm the parsed data in under 5 minutes.
- Produce a normalized, scalable ingredient list with servings adjustment and validator feedback.
- Offer one-click exports to `.json`, `.txt`, and Google Drive, while supporting a WebXR board for hands-free cooking.

## 3. Non-Goals (MVP)
- No nutrition calculation, allergy detection, or pantry inventory management.
- No multi-language or offline OCR/STT for MVP.
- No native mobile applications or full analytics dashboards yet.

## 4. Primary Users & User Stories
- **Home cook digitizing handwritten recipe cards**
  - As a home cook, I want to photograph an old recipe card and quickly fix OCR mistakes so I can store the recipe digitally.
  - As a home cook, I want to scale a family recipe from 4 to 12 servings without redoing fraction math.
- **Recipe creator capturing ideas by voice**
  - As a recipe creator, I want to dictate a new recipe while cooking so I can capture steps without typing.
  - As a recipe creator, I want validators to call out missing quantities or timers so I can fill gaps before publishing.
- **Tech-savvy kitchen enthusiast using XR**
  - As an XR user, I want a floating recipe board with hands-free navigation so I can cook without touching screens.
  - As an XR user, I want timers and serving adjustments to sync from the main app so the overlay stays current.

## 5. Success Metrics
- =90% of printed recipe lines extracted without manual correction; =80% for typical handwriting.
- Average confirmation flow (upload -> validated data) < 5 minutes.
- =90% export success rate to Google Drive and local formats during beta.
- < 3% critical production errors per week (failed jobs, unhandled exceptions).

## 6. Experience Flow (Happy Path)
1. User signs in with Google (PKCE) to enable Drive integration.
2. User uploads an image or records audio.
3. Backend orchestrator stores the raw asset, triggers OCR (classical provider) and OpenAI parsing.
4. Client receives structured draft recipe plus validator warnings.
5. User confirms or edits ingredients and steps, adjusts servings, and re-runs validators on save.
6. User exports recipe as `.json`/`.txt` and optionally uploads to Google Drive.
7. User activates WebXR mode to display the guided cooking board.

## 7. Functional Requirements
- **Ingestion**: Support image upload, drag-and-drop, and capture via device camera; support audio recording via MediaRecorder.
- **OCR Pipeline**: Run classical OCR (Azure Read or Google Cloud Vision) for text and coordinates; run OpenAI Responses API with vision input for structure and normalization; merge results with confidence metadata.
- **Voice Pipeline**: Stream or upload audio to backend; transcribe using OpenAI Whisper (gpt-4o-mini-transcribe) or fallback STT; align timestamps when possible.
- **Parsing & Validation**: Normalize unicode fractions, units, ingredient names; detect ranges and 'to taste' entries; surface validator warnings (missing data, suspicious quantities, unknown units).
- **Scaling Engine**: Accept original and target servings; scale numeric or ranged quantities while respecting unit rules and rounding.
- **Data Persistence**: Store recipes, ingredients, instructions, files, and audit runs in Postgres; provide version history per recipe revision.
- **Exports & Drive**: Generate `.json` and `.txt` exports; upload to Google Drive using user-granted tokens; track export status in database.
- **WebXR Board**: Render steps, timers, and servings in an XR scene with voice navigation cues; sync updates from the main React state via shared store or websocket channel.
- **Observability**: Log request IDs, provider latency, token usage; capture structured error events with redacted PII.

## 8. Data Model Highlights
- Recipes table with metadata (source type, servings, provider, warnings, files).
- Ingredients and instructions tables linked via foreign keys with ordering fields.
- Runs/audit table capturing OCR, parse, validation, export operations with payload context.
- Files metadata stored as JSONB with storage paths or signed URLs.

## 9. External Integrations
- **OpenAI APIs**: Responses API with multimodal input for OCR cleanup, JSON extraction, and validation hints; Whisper/gpt-4o-mini-transcribe for audio transcription.
- **Classical OCR Provider**: Azure Computer Vision Read or Google Cloud Vision for deterministic text extraction and bounding boxes.
- **Google OAuth & Drive**: PKCE flow on client, short-lived tokens sent to backend for Drive upload (scope `drive.file`).
- **Storage**: Cloud bucket (S3-compatible) or local disk in development for raw images/audio and export artifacts.

## 10. Constraints & Assumptions
- Token budgets capped per user/session; fallback to classical OCR if OpenAI fails or exceeds limits.
- All secrets managed via environment variables; no secrets in client bundle or repo.
- MVP expects reliable network connectivity; offline mode deferred.

## 11. Risks & Mitigations
- **Handwriting variability**: Provide confirm-and-correct UI, highlight low-confidence lines, allow selective re-scan.
- **LLM hallucinations**: Constrain prompts with JSON schema, validate with Zod, and merge with raw OCR text when validation fails.
- **Cost spikes**: Track per-request token usage, enforce user quotas, and degrade gracefully to classical OCR-only path.
- **Latency**: Parallelize OCR and STT calls, stream partial results to UI, and cache successful extractions for re-use.
- **Privacy**: Redact PII in logs, offer opt-out of raw asset retention, and schedule automated purges.

## 12. Release Plan (Phased)
1. **Dogfood**: Internal team runs through 20 recipes; evaluate parser accuracy and validator usefulness.
2. **Closed Beta**: Invite 5-10 users; capture structured feedback; refine prompts and scaling heuristics.
3. **Hardening**: Add instrumentation, retry policies, token budget alerts, and documentation updates.
4. **Public Alpha**: Gated invite flow; monitor telemetry and iterate on WebXR UX.

## 13. Open Questions
- Which classical OCR provider offers best handwriting support for target recipes? Need quick benchmark.
- Should we store user-specific personalization (ingredient aliases) in MVP or defer?
- Do we require full offline fallback for XR board when network drops mid-session?

