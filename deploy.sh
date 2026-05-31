#!/usr/bin/env bash
# UnifyAPIs one-line deployment script.
# Installs dependencies, applies the database schema, seeds initial data,
# builds the Next.js app, and starts the production server.
#
# Usage:
#   ./deploy.sh
#
# Required env vars (see .env.example):
#   DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL,
#   GROQ_API_KEY, STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
set -euo pipefail
npm ci && npm run db:push && npm run db:seed && npm run build && npm run start
