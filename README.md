# XR Recipe Generator

## Prerequisites
- Node.js 20+
- npm 10+

## Initial Setup
1. Install dependencies:
   `ash
   npm install
   `
2. Copy environment templates and update as needed:
   `ash
   copy server/.env.example server/.env
   copy client/.env.example client/.env
   `
   - Configure OCR_PROVIDER and credentials in server/.env if you want to call Azure Computer Vision or Google Vision.
   - The default DATABASE_URL uses SQLite (ile:./dev.db). Switch to Postgres by replacing the URL once a Prisma schema is defined.

## Running Locally
Open two terminals from the project root:

- **Terminal A – API**
  `ash
  npm run dev:server
  `
  - Starts the Express server on http://localhost:4000.
  - Deterministic routes are available at /api/ocr/image, /api/parse, /api/validate, /api/scale, and /api/export.

- **Terminal B – Client**
  `ash
  npm run dev:client
  `
  - Launches the Vite dev server on http://localhost:5173.
  - Requests to /api/* proxy to the local API instance.

Visit http://localhost:5173 to interact with the React workspace UI (image upload, parsing, scaling, and export flows are wired to the deterministic API pipeline).

## Project Structure
`
client/     React + Vite frontend (Zustand, React Query, Tailwind)
server/     Express API (TypeScript, deterministic OCR ? parse ? validate ? scale ? export services)
packages/   Shared TypeScript types
Instructions/ PRD and Tech Stack documentation
`

## Notes
- Classical OCR (Azure/GCV) adapters currently emit placeholder logs when credentials are missing; hook them up to real providers by filling the environment variables.
- The parser, validator, scaler, and exporter services are deterministic and return structured warnings so the client can drive the Confirm & Correct experience.
- Run 
pm run lint or 
pm run test in each workspace; test suites are ready for future additions.
