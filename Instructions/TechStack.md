# XR Recipe Generator – Tech Stack

## 1. Architectural Overview
- **Pattern**: PERN (Postgres, Express, React, Node) with TypeScript end-to-end.
- **Runtime**: Node.js 20 LTS across client tooling (Vite) and server.
- **Client**: React + Vite SPA with WebXR support, state managed via Zustand + React Query.
- **Server**: Express API orchestrating OCR/STT workflows, queued jobs, and Google Drive exports.
- **Database**: Prisma ORM (SQLite locally by default, Postgres in production) for type-safe data access and migrations.
- **AI Services**: OpenAI Responses API for multimodal extraction + validation, Whisper/gpt-4o-mini-transcribe for audio, optional classical OCR provider integration.

## 2. Repository & Package Management
- Mono-repo structured as:
  - `client/` – React app.
  - `server/` – Express API + workers.
- Package manager: npm workspaces (v10+) for dependency sharing.
- Shared utilities in `packages/` for cross-cutting concerns (schemas, logging, types).

## 3. Frontend Stack
- **Framework**: React 18 with TypeScript strict mode.
- **Bundler**: Vite with SWC for fast dev builds, configured for WebXR.
- **UI**: Tailwind CSS + Radix UI primitives for accessible components; use CSS variables for theme.
- **State/Data**: Zustand for local state, React Query for server cache, Zod for runtime validation.
- **Routing**: React Router 6 with nested routes (dashboard, detailed recipe view, XR mode).
- **Media Handling**: browser MediaRecorder API wrappers for audio capture, FilePond or custom drag-drop for image upload.
- **XR**: three.js + WebXR polyfills; device capability detection via `navigator.xr` checks.
- **Testing**: Vitest + React Testing Library; Playwright for smoke E2E flows (upload -> confirm -> export).

## 4. Backend Stack
- **Framework**: Express 5 with TypeScript; structured routes under `/api/*` with layered architecture (routes ? controllers ? services ? adapters).
- **Runtime Services**:
  - OCR service orchestrator (classical provider + OpenAI fusion).
  - STT service wrapping OpenAI Whisper API.
  - Parsing/validation service using shared schema utilities.
  - Scaling engine service returning normalized fractions.
  - Google Drive service handling OAuth tokens and uploads.
- **Background Tasks**: synchronous processing in-process for MVP; reintroduce a queue when throughput demands it.
- **Validation**: Zod schemas at API boundaries; express middleware for request validation.
- **Security**: Helmet for headers, cors allowlist, rate limiting via `express-rate-limit`.
- **Logging**: Pino with pino-http; correlation IDs with `cls-hooked` or AsyncLocalStorage.
- **Testing**: Jest + Supertest for API routes, ts-jest for type support.

## 5. Database & Persistence
- **DB**: Postgres 15 installed locally (or managed cloud); Prisma migrations tracked in repo.
- **Schema**: Tables for recipes, ingredients, instructions, files, runs (audit), users (Google account metadata), sessions.
- **Connection**: `pgbouncer` ready configuration for production; Prisma client pooling in server.
- **Storage**: S3-compatible bucket in production; local development can use filesystem storage referenced from Postgres `files` JSONB (no blobs in DB).
- **Caching**: none required for MVP; rely on in-process state and client caching.

## 6. AI & External Integrations
- **OpenAI**:
  - Use Responses API with `gpt-4o-mini` for structured recipe extraction from OCR text + images.
  - Use `gpt-4o-mini-transcribe` (Whisper) for speech-to-text.
  - Implement adapter module in `server/src/adapters/openai.ts` to isolate API usage, handle retries, timeouts, exponential backoff, and cost logging.
- **Classical OCR**: Adapter modules for Azure Computer Vision Read and Google Cloud Vision; pluggable via feature flags stored in env.
- **Google Identity Services**: Client PKCE flow with `@react-oauth/google`; backend verifies tokens using Google APIs.
- **Google Drive**: Node client library with resumable uploads, restricted to `drive.file` scope.
- **Telemetry**: Optional Sentry SDK for error reporting (server + client) via wrapper adapters.

## 7. DevOps & Tooling
- **Local services**: optional Postgres instance if you prefer it over the default SQLite; configure via `.env`.
- **CI/CD**: GitHub Actions running lint, typecheck, unit tests, and build; artifacts published for PR reviews.
- **Env Management**: `.env.example` per package; use Doppler/Vault or platform secrets in production.
- **Deployment Targets**: Render/Fly.io for server, Vercel/Netlify for client; managed Postgres (Neon, Supabase, RDS) or serverless SQLite providers (Turso, PlanetScale) if desired.
- **Monitoring**: Prometheus-compatible metrics endpoint on server; Grafana dashboard templates stored in `infra/monitoring/`.

## 8. Security & Compliance
- Enforce HTTPS, HSTS, and CSP headers; limit iframe embedding.
- Token handling: short-lived JWT for session, refresh tokens stored HttpOnly Secure cookies.
- Minimal data retention; scheduled job purges raw media after configurable window.
- Log redaction middleware removes email, names, tokens before persistence.
- Access controls around recipe ownership; row-level security considered for future multi-tenant support.

## 9. Testing & Quality Strategy
- **Unit**: Jest/Vitest for parsing, scaling, validators; aim for =90% coverage on critical libraries.
- **Integration**: Supertest hitting Express routes with mocked adapters; contract tests for OpenAI adapters using recorded fixtures.
- **E2E**: Playwright flows for upload/confirm/export and XR entry.
- **Static Analysis**: ESLint (typescript-eslint) enforcing single quotes, import ordering; Prettier with project overrides; TypeScript strict across packages.
- **Performance**: Lighthouse checks for client; k6 scripts for backend throughput (OCR queue, exports).

## 10. Local Development Workflow
- `npm install` at repo root to set up workspace dependencies.
- `npm run dev:server` and `npm run dev:client` run the API and client respectively with hot reload; configure `DATABASE_URL` for SQLite (default) or Postgres.
- Mock providers: use recorded OCR/STT fixtures during offline dev; toggle via env `PROVIDER_MODE=mock`.
- Seed scripts populate sample recipes and media references for quick testing.

## 11. Future Enhancements (Post-MVP)
- Add feature flag service (Unleash or LaunchDarkly) for experimentation.
- Introduce vector search for semantic recipe retrieval using Postgres + pgvector.
- Evaluate LangGraph/RAG workflow for advanced correction suggestions.

