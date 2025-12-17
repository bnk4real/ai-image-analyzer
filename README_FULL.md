# Report AI Analysis

A Next.js application for generating and managing AI-assisted roofing and report analyses. Uses Prisma ORM for database access and integrates with external AI services for image and text analysis.

## Features

- User authentication with a dedicated login page (login layout excludes the site navbar)
- Image analysis API integration (Google Gemini or other AI providers)
- Roof/report description generator UI
- Model selection UI and persistence to the database
- Prisma ORM with PostgreSQL
- Next.js App Router with nested layouts and server components

## Requirements

- Node.js 18+
- npm or yarn
- PostgreSQL database (or compatible datasource)

## Quick Setup

1. Clone the repository

```bash
git clone <repo-url>
cd report-ai-analysis
```

2. Install dependencies

```bash
npm install
# or
# yarn install
```

3. Configure environment variables

Create a `.env` file in the project root (copy `.env.example` if present) and set the following variables:

- `DATABASE_URL` — PostgreSQL connection string
- Any API keys required by your AI provider (e.g. `GOOGLE_API_KEY`)

Example `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/report_ai
GOOGLE_API_KEY=your_key_here
```

4. Prisma setup

- Generate Prisma client:

```bash
npx prisma generate
```

- If you want to sync Prisma with an existing database schema:

```bash
npx prisma db pull
```

- To apply migrations (when you have changes to apply):

```bash
npx prisma migrate dev
```

5. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Important Implementation Notes

- The login page uses a dedicated layout at `src/app/login/layout.tsx` that intentionally does not render the site navbar. The root layout at `src/app/layout.tsx` renders the `Navbar` for all routes unless a nested layout overrides it.
- Database queries are organized under `src/lib/repositories` (e.g. `aiModelsRepository.ts`). Keep DB logic inside repositories for reusability and testing.
- After editing `prisma/schema.prisma`, run `npx prisma generate` to refresh the Prisma client.

## Project Structure

- `src/app/` — Next.js App Router pages and layouts
  - `login/` — login page and layout (no navbar)
  - `settings/` — model selection and settings UI
  - `image-analysis/` — image-analysis UI and routes
- `src/lib/` — utility modules (Prisma client, repositories, services)
- `src/app/api/` — API routes
- `prisma/` — Prisma schema

## Common Commands

- Pull database schema to Prisma:

```bash
npx prisma db pull
```

- Regenerate Prisma client:

```bash
npx prisma generate
```

- Run migrations:

```bash
npx prisma migrate dev --name "describe-migration"
```

## Troubleshooting

- If the Prisma client doesn't expose a model, run `npx prisma generate` after updating `prisma/schema.prisma`.
- If `@/...` imports fail, ensure `tsconfig.json` paths are configured and Next can resolve aliases.
- If the navbar still appears on `/login`, confirm `src/app/login/layout.tsx` exists and `src/app/login/page.tsx` lives under the `login` folder.

## Development Tips

- Use nested layouts to control per-route UI (for example, hide navigation on auth pages).
- Keep repository functions (DB queries) in `src/lib/repositories`.
- Log server errors and return helpful messages to the client.

## License

MIT
