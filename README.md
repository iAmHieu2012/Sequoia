# Sequoia

Sequoia is an AI/ML educational platform featuring a structured curriculum and on-device model inference capabilities.

## Project Structure

- `docs/`: Product requirements, system design, user flows, and configuration guides.
- `src/`: Next.js full-stack application source code (Frontend + API Routes).
- `supabase/`: Database configurations and migrations.

## Documentation

Please refer to the `docs/` directory for detailed technical specifications.

## Local Development

### 1. Web App (Next.js Full-stack)

```bash
npm install
npm run dev
```

The web application (Frontend + API) will be accessible at `http://localhost:3000`.

### 2. Database (Supabase)

```bash
npx supabase start
```

Apply the migration file: `supabase/migrations/00_reset_and_init.sql`.

### 3. Seed Data

```bash
npx tsx scripts/seed.ts
```
