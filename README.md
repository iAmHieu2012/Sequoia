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

Apply the migration file: `supabase/migrations/00_init.sql`.

Authentication uses Firebase (Email/Password and Google). See `docs/operations/deployment.md` for the Firebase setup and the environment variables.

To reload data exported from the Supabase dashboard (CSV files in `supabase/export/`):

```bash
npx tsx scripts/import_export.ts
```

### 3. Seed Data

```bash
npx tsx scripts/seed.ts
```

### 4. Grant admin rights

```bash
npx tsx scripts/make_admin.ts you@example.com   # sign in on the site once first
```
