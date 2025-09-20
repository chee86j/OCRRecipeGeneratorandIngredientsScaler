
# XR Recipe Generator — TODO.md (Extreme Detail)

> **Vision**  
> Scan handwritten and printed recipes, parse ingredients & instructions, scale quantities by servings, validate errors, capture voice notes, and export/upload to Google Drive. Render a WebXR “recipe board” for hands‑free cooking with step timers and voice controls.

---

## 0) Scope / Non‑Goals
**In scope (MVP)**
- Handwriting/printed OCR (cloud provider or OpenAI Vision) with confirm-and-correct UI.
- Audio capture and speech‑to‑text (STT) for dictated recipes/notes.
- Robust parsing into structured JSON with unit normalization and fraction handling.
- Scaling engine for servings (including ranges and “to taste”).
- Error checking (units, quantities, spell‑hints) with inline, clickable warnings.
- Export `.txt`/`.json`; Google Drive upload (OAuth 2.0 PKCE).
- WebXR “recipe board” overlay with step-by-step guidance and timers.

**Out of scope (MVP, consider post‑MVP)**
- Full pantry object detection/ingredient overlay via CV.
- Multi‑language OCR/STT beyond en‑US.
- Nutrition facts inference; allergy warnings.
- Inventory management or shopping list sync.
- Offline OCR/STT.

---

## 1) Architecture (PERN + Cloud OCR/STT + WebXR)
- **Client**: React + Vite; WebXR (three.js); MediaRecorder for audio; optional Web Speech for quick on‑device STT; React Query/Zustand for state/data.
- **Server**: Node + Express (TypeScript). Services: `/ocr`, `/stt`, `/parse`, `/scale`, `/validate`, `/drive`.
- **DB**: Postgres (recipes, ingredients, instructions, files, runs, audit).
- **Cloud**: (choose strategy per 2.3) Azure Computer Vision Read / Google Cloud Vision **or** OpenAI Vision via Responses API for image understanding; Whisper/“gpt‑4o‑mini‑transcribe” for audio STT.
- **Auth**: Google OAuth 2.0 PKCE (scope `drive.file`). Optional JWT for app auth.
- **Build/Deploy**: Docker + docker‑compose; GitHub Actions; deploy to Render/Railway/Fly.io.
- **Observability**: Pino/Winston logs (JSON), request IDs, error reporting (Sentry‑style hook), minimal metrics.
- **Privacy/Sec**: PII redaction in logs; signed URLs; short‑lived tokens; CSP; CORS allowlist; secrets via env.

---

## 2) Decision Matrix — OCR Strategy
| Criterion | **A) Classical OCR (Azure/Google)** | **B) OpenAI Vision (single‑pass JSON)** | **C) Hybrid (OCR → OpenAI cleanup)** |
|---|---|---|---|
| Handwriting robustness | High (Read/Doc AI tuned for OCR) | Medium (VLM may hallucinate on dense text) | **High** (OCR text + LLM structure) |
| Determinism | High (line/word boxes, order) | Medium (nondeterministic generation) | **High** for extraction; flexible cleanup |
| Layout/coords | Built‑in (per‑line bbox, rotation) | Limited (no guaranteed bboxes) | Use OCR boxes; LLM for semantics |
| Cost predictability | High (per page/image) | Token‑based (image tokens + text) | Mix; optimize prompts |
| Dev speed (MVP) | Medium | **High** (one call for JSON) | Medium |
| Failure behavior | Extract partial text | Possible hallucinations/omissions | **Best**: fall back to raw OCR if needed |
| Recommendation | — | — | **Pick C: Hybrid** for production reliability |

**Action**: Implement **C** first; keep **B** behind a feature flag to A/B on quality/speed.

---

## 3) Data Model (DB + Wire)
```ts
// recipes
id (uuid), title (text), source_type ('ocr'|'voice'|'manual'|'hybrid'),
original_servings (int, null), created_at (timestamptz), updated_at (timestamptz),
raw_text (text), ocr_provider ('azure'|'gcv'|'openai'|null), stt_provider ('whisper'|'gcloud'|null),
warnings (jsonb), files (jsonb: [{type:'image'|'audio'|'export', url, mime, bytes}])

// ingredients (child of recipe)
id, recipe_id (fk), raw (text), qty_numeric (numeric, null), qty_range_min (numeric, null),
qty_range_max (numeric, null), unit (text, null), ingredient (text), note (text, null),
normalized_grams (numeric, null), sort_order (int)

// instructions (child of recipe)
id, recipe_id (fk), step_no (int), text (text), timer_seconds (int null)

// runs (audit)
id, recipe_id, user_id (null), action ('ocr'|'parse'|'validate'|'export'|'upload'), payload (jsonb), ts
```

**Shared JSON (wire)**
```ts
interface ParsedRecipe {
  id: string;
  title: string;
  source: { type: 'ocr'|'voice'|'manual'|'hybrid'; refs?: string[] };
  originalServings?: number|null;
  ingredients: Array<{
    raw: string;
    qty: number | { min: number; max: number } | null;
    unit: string | null;
    ingredient: string;
    note?: string | null;
  }>;
  instructions: string[];
  warnings: string[];
  createdAt: string;
}
```

---

## 4) Endpoints (Server)
- `POST /api/ocr` → `{ lines: string[], provider_meta }`
- `POST /api/vision-extract` (OpenAI) → `{ json: ParsedRecipe, raw_text }`
- `POST /api/stt` → `{ text, confidence? }`
- `POST /api/parse` → `{ recipe: ParsedRecipe }` (from raw text)
- `POST /api/scale` → `{ recipe: ParsedRecipe }` (with scaled qtys)
- `POST /api/validate` → `{ recipe: ParsedRecipe }` (warnings[])
- `POST /api/drive/upload` → `{ fileId, webViewLink }`
- `POST /api/export` → returns file stream (`.txt` or `.json`)

**Non‑functional**
- Rate‑limit per IP.
- Request‑ID middleware; include in logs and responses.
- Safe error serializer (no stack in prod responses).

---

## 5) Frontend UX (Single‑screen, power‑user friendly)
- **Top bar**: “Scan/Upload Image”, “Record Voice Note”, “Paste Text”.
- **Main**: Left tabs: **Extracted Text**, **Structured Recipe**, **XR Preview**.
- **Right drawer**: Warnings (click to focus field), Suggestions.
- **Footer**: Servings stepper, Export (.txt/.json), **Google Drive Upload** CTA.
- **Keyboardable**: all edits via keyboard; minimal clicks; mobile friendly.
- **A11y**: large font for Step Mode; high contrast; focus outlines.

**XR board interactions**
- Pin floating panel; swipe/pinch for next/prev step; voice “start timer 10 minutes”; toggle imperial/metric; large progress ring timer.

---

## 6) Implementation Tasks (Checklists)
### 6.1 Bootstrap & Infra
- [ ] Create mono‑repo structure (`client/`, `server/`, `infra/`).
- [ ] Dockerize client & server; compose with Postgres.
- [ ] Add ESLint/Prettier; TypeScript strict mode.
- [ ] Pino/Winston logging with request IDs.
- [ ] Basic CI (lint, typecheck, unit tests).

### 6.2 OCR — Classical Providers
- [ ] Add Azure Read **or** Google Cloud Vision client with retries and exponential backoff.
- [ ] Image pre‑process: auto‑crop, deskew, denoise, contrast stretch (Sharp/OpenCV).
- [ ] Submit image bytes; poll for completed operation (Azure) or synchronous call (GCV).
- [ ] Extract lines with bounding boxes, reading order; persist `raw_text` + `provider_meta`.
- [ ] Fallback chain: if low confidence or empty lines → try alternate provider (feature flag).

### 6.3 OpenAI Vision — Single‑Pass JSON (Feature Flag)
- [ ] Implement Responses API call with `input_image` + structured prompt template for **strict JSON** output.
- [ ] Add response schema validator (Zod): reject if missing fields; show raw text fallback.
- [ ] Chunk large images (tiling) if token calc too high; recombine text; reprompt for structure.
- [ ] Guardrails: add "If unsure, leave value null" instruction to reduce hallucinations.
- [ ] Compare outputs vs Classical OCR on a 20‑image benchmark; log metrics.

**Prompt Template (summary)**
- Role: “You are an extraction engine. Output strict JSON only. Keys: title, originalServings, ingredients[], instructions[]. Unknown → null.”
- Few‑shot with 3 lines showing fractions, ranges, “to taste”, parentheticals.

### 6.4 Voice Recording & STT
- [ ] Implement MediaRecorder capture with 15–30s cap per clip; show time bar.
- [ ] Client quick‑STT (Web Speech) with user opt‑in; show disclaimer of variability.
- [ ] Server STT via Whisper / gpt‑4o‑mini‑transcribe; accept `audio/webm` and `audio/mpeg`.
- [ ] Merge STT text with OCR text (if both present) into a single draft; de‑dup repeated phrases.
- [ ] Save raw audio file to storage (if user consents) and reference in `files[]`.

### 6.5 Parsing & Normalization
- [ ] Unicode fraction normalizer (½→1/2, etc.).
- [ ] Ingredient line parser (regex + tokenization) with unit alias map (tsp/tbsp/cup/oz/lb/g/kg/ml/l/pinch).
- [ ] Handle ranges (3–4), “to taste” (qty=null), parentheticals (“softened”), plural units.
- [ ] Density table (optional v1): flour, sugar, butter, oil, milk, water; unit conversions.
- [ ] Serializer to DB entities; keep original `raw` for traceability.

### 6.6 Scaling Engine
- [ ] Inputs: `originalServings`, `targetServings`, list of ingredients.
- [ ] Outputs: scaled quantities; formatting to kitchen‑friendly fractions (⅛, ¼, ⅓, ½, ⅔, ¾).
- [ ] Rules: round granularity based on unit; keep “to taste” unchanged; maintain ranges.
- [ ] Unit tests: 30+ cases (fractions, large/small scaling, spices edge cases).

### 6.7 Error‑Checking & Confirm UI
- [ ] Validators: section presence; unit validity; quantity guardrails; naive spell‑hints.
- [ ] Inline warnings; click → focus the field; keyboard shortcuts (e.g., Alt+Enter to accept).
- [ ] “Re‑scan region” flow: crop a sub‑area and resubmit to OCR/Vision.
- [ ] Show confidence badges (provider confidence if available; heuristic otherwise).

### 6.8 Google Drive Integration
- [ ] Add Google Identity Services (PKCE) on client; scope `drive.file`.
- [ ] Server `/drive/upload` endpoint: multipart or resumable uploads; return `fileId` + `webViewLink`.
- [ ] Exporters: `.txt` (human‑readable) and `.json` (structured). Optional `.pdf` later.
- [ ] Handle token expiry; prompt re‑auth as needed; do not store refresh tokens (MVP).

### 6.9 WebXR Board
- [ ] Three.js + WebXR scene bootstrap; anchor a panel in world space.
- [ ] Step mode UI (large text; next/prev gestures; voice “next step”). 
- [ ] Timer control with ring animation; voice: “start 8‑minute timer”. 
- [ ] Servings stepper (sync back to app state). 
- [ ] A11y contrast/luminance; safe color palette near hot surfaces.

### 6.10 Security, Privacy, Compliance
- [ ] CORS allowlist; strict CSP; HTTPS everywhere.
- [ ] Don’t log raw images/audio in prod; redact PII; configurable sampling.
- [ ] Secrets via env/secret manager; no secrets in client bundle.
- [ ] Data retention policy; user delete/export flows (simple CSV/JSON export).

### 6.11 Testing Strategy
- **Unit**: parsing, scaling, validators, formatters (90%+ coverage on lib).
- **Integration**: `/ocr`, `/stt`, `/parse`, `/validate`, `/drive` with mocked providers.
- **E2E**: Cypress/Playwright flows: upload → parse → fix → export → upload.
- **Benchmark set**: 20 handwritten, 20 printed recipes; track CER/WER, extraction completeness, time.
- **Load tests**: k6/Artillery for 10 RPS sustained on `/ocr` and `/stt` (MVP scale).

### 6.12 Observability
- [ ] Structured logs with request IDs, user agent, provider, latency, token usage (if OpenAI).
- [ ] Minimal metrics: OCR latency, STT latency, parse success rate, Drive success rate.
- [ ] Error taxonomy + dashboard (e.g., `/metrics` JSON for quick Grafana later).

### 6.13 Delivery Artifacts
- [ ] README with quick start (docker‑compose up).
- [ ] `.env.example` (server/client).
- [ ] API.md with request/response examples.
- [ ] Sample images/audio in `docs/samples/` with expected outputs.
- [ ] Changelog; Licenses; Contribution guide.

---

## 7) Acceptance Criteria (MVP)
- Upload a recipe image → receive structured JSON with ≥95% line coverage on printed, ≥80% on typical handwriting (post‑confirm).
- Record 15s voice note → transcription captured with ≥90% intelligible words for clear speech.
- Adjust servings from 4 → 10 → scaled ingredient list with correct rounding rules.
- At least 5 validator classes surface actionable warnings; edits resolve them.
- Export `.json` + `.txt` and upload to Google Drive with user consent.
- WebXR board renders steps and timers reliably on a supported mobile browser/headset.

---

## 8) Rollout Plan
- **Phase 1**: Internal dogfood (20 scanned cards). Collect parser misses; refine prompts and unit aliases.
- **Phase 2**: Small beta (5 users). Add feedback capture inline. 
- **Phase 3**: Hardening (error budgets, retries, timeouts). Docs and demo video.
- **Phase 4**: Public alpha (invite link) with basic telemetry.

---

## 9) OpenAI vs Classical OCR — Implementation Notes
- **OpenAI Vision advantages**: one‑shot JSON extraction, flexible interpretation of messy layouts, can normalize/standardize terms while extracting. 
- **Trade‑offs**: nondeterminism, potential hallucination on dense or low‑contrast handwriting, token‑based pricing; lack of guaranteed line‑level bounding boxes.
- **Recommendation**: Use **Hybrid**. Run classical OCR to get deterministic text + line order (and coordinates), then call OpenAI to **structure** (ingredients/instructions), normalize units, and propose corrections. Keep a feature flag for a **Vision‑only** fast path when images are clean.

**Prompting tips for Vision** (if enabled):
- Instruct: “If unsure, output `null`. Do not invent values.”
- Constrain output with a JSON Schema and validate with Zod. On failure, reprompt with stricter guidance or fall back to classical OCR.
- Tile very high‑res images (or downsample) to control token usage; include page numbers if multi‑image.

---

## 10) Risk Register & Mitigations
- **Handwriting variability** → Require confirm step; offer region re‑scan; maintain improvement log.
- **Provider outages** → Circuit breaker + fallback provider; cache successful parses.
- **Token/cost spikes** (Vision/STT) → Budget guard; per‑user daily caps; image tiling; prompt compression.
- **Privacy** → Opt‑in storage of raw media; retention window; purge job (daily).
- **Latency** → Parallelize OCR and STT; eager render text view while structuring in background. 
- **XR device quirks** → Feature detect; deactivate XR controls on unsupported browsers.

---

## 11) Cost & Usage Tracking (no hard prices in repo)
- Record: image bytes, dimensions, provider, tokens (if OpenAI), duration (STT), latency.
- Dashboard: $/100 images, $/hour audio, avg latency by provider.
- Alerts: per‑day budget; circuit break Vision if over budget; auto‑switch to classical OCR.

---

## 12) Roadmap After MVP
- Multi‑language OCR/STT; language auto‑detect.
- Nutrition estimates; substitutions; allergen flags.
- Shopping list export; calendar meal‑plan integration.
- Native apps (RN/Unity); visionOS board.
- Personal model fine‑tuning on your recipe corpus for better parsing.

---

*Generated: 2025-09-20*
