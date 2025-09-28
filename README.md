# My Strapi Project

This repository now hosts both halves of the stack:

- `backend/` – the Strapi 4 application deployed to Strapi Cloud.
- `frontend/` – a Next.js 14 application that consumes the Strapi APIs.

## Prerequisites

- Node.js 18.x or 20.x (matches Strapi Cloud requirements).
- npm 8+ (to use workspaces).

## Getting Started

Install dependencies for both workspaces from the repository root:

```bash
npm install
```

### Run the Strapi backend

```bash
npm run backend:dev
```

The command runs `strapi develop` inside `backend/`. Environment variables live in `backend/.env`.

### Run the Next.js frontend

```bash
npm run frontend:dev
```

The app starts on [http://localhost:3000](http://localhost:3000). Update API URLs in the frontend as you build out the integration.

## Deploying to Strapi Cloud

- Repository: `my-strapi-project`
- Base directory: `/backend`
- Branch: `main`
- Node version: default (18 LTS at the time of writing)

Populate the Strapi Cloud environment variables using the keys from `backend/.env.example`.

## Deploying the frontend

The Next.js app can be deployed separately (Vercel, Netlify, etc.). Configure it to build from `/frontend` and provide environment variables for the backend API URL.

## Additional Scripts

- `npm run backend:build` – builds the Strapi admin panel.
- `npm run backend:start` – runs Strapi in production mode.
- `npm run backend:deploy` – wraps `strapi deploy` for Strapi Cloud.
- `npm run frontend:build` – builds the Next.js app.
- `npm run frontend:start` – serves the production build.
- `npm run frontend:lint` – runs Next.js linting rules.

Refer to `backend/README.md` for Strapi-specific documentation.
