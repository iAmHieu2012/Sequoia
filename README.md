# Sequoia

Sequoia is an AI/ML educational platform featuring a structured curriculum and on-device model inference capabilities.

## Project Structure

- `docs/`: Product requirements, system design, user flows, and configuration guides.
- `web/`: Next.js full-stack application (Frontend + API Routes + Supabase integration).
- `android/`: Native Android application built with Kotlin and Jetpack Compose.

## Documentation

Please refer to the `docs/` directory for detailed technical specifications.

## Local Development

### 1. Web App (Next.js Full-stack)

```bash
cd web
npm install
npm run dev
```

The web application (Frontend + API) will be accessible at `http://localhost:3000`.

### 2. Database (Supabase)

```bash
cd web
npx supabase start
```

Apply the migration file: `web/supabase/migrations/00_reset_and_init.sql`.

### 3. Seed Data

```bash
cd web
npx tsx scripts/seed.ts
```
