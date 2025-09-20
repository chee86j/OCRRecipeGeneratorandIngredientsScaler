# XR Recipe Generator

## Prerequisites
- Node.js 20+
- npm 10+

## Initial Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment templates and update as needed:
   ```bash
   copy server/.env.example server/.env
   copy client/.env.example client/.env
   ```
   - Set `OPENAI_API_KEY` in `server/.env` when you are ready to integrate real API calls.
   - The default `DATABASE_URL` uses SQLite (`file:./dev.db`). Switch to Postgres by replacing the URL once a Prisma schema is defined.

## Running Locally
Open two terminals from the project root:

- **Terminal A ? API**
  ```bash
  npm run dev:server
  ```
  - Starts the Express server on `http://localhost:4000`.
  - OCR adapters and exports currently emit placeholder `console.log` messages so the app runs without external providers.

- **Terminal B ? Client**
  ```bash
  npm run dev:client
  ```
  - Launches the Vite dev server on `http://localhost:5173`.
  - Requests to `/api/*` proxy to the local API instance.

Visit `http://localhost:5173` to interact with the React workspace UI (image upload, voice recording, and export flows are stubbed with placeholder logs until the real services are wired up).

## Project Structure
```
client/     React + Vite frontend (Zustand, React Query, Tailwind)
server/     Express API (TypeScript, placeholder adapters for OpenAI/classical OCR)
packages/   Shared TypeScript types
Instructions/ PRD and Tech Stack documentation
```

## Notes
- Classical OCR (Azure/GCV) and Google Drive integrations are optional; adapters currently log placeholder activity when credentials are missing.
- Logging is intentionally verbose in the adapters/components to make it easy to replace the placeholders with real API calls later.
- Run `npm run lint` or `npm run test` in workspaces as they come online; the commands are defined but no tests exist yet.
