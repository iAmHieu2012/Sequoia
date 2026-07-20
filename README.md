# Sequoia

Sequoia is an AI/ML educational platform featuring a structured curriculum and on-device model inference capabilities.

## Project Structure

- `docs/`: Product requirements, system design, user flows, and configuration guides.
- `web/`: Next.js web application.
- `android/`: Native Android application built with Kotlin and Jetpack Compose.
- `core/`: Ktor backend acting as an API Gateway, handling logic, authorization, and Firebase/R2 connections.

## Documentation

Please refer to the `docs/` directory for detailed technical specifications.

## Local Development

### 1. Backend (Ktor)

```bash
cd core
./gradlew run
```

The server will start at `http://0.0.0.0:8080`.

### 2. Web Client (Next.js)

```bash
cd web
npm install
npm run dev
```

The web application will be accessible at `http://localhost:3000`.
