# UnifyAPIs

> Your personal catalog of reliable free & freemium APIs with usage tracking and AI assistance.

## Features

- 🔍 **Browse & Search** — Searchable catalog of curated free & freemium public APIs
- 📚 **Personal Library** — Save APIs, add notes, set usage limits
- 📊 **Usage Tracking** — Log API calls and track against free tier limits
- 🤖 **AI Assistance** — Get API recommendations and code snippets via Groq
- 💳 **Pro Plan** — Stripe billing for advanced features

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **API Layer**: tRPC v11 (type-safe end-to-end)
- **ORM + DB**: Drizzle ORM + PostgreSQL
- **Auth**: Better-Auth (email + password)
- **AI**: Groq API (llama3-8b-8192)
- **Billing**: Stripe
- **Validation**: Zod
- **State**: TanStack Query (via tRPC)

## Getting Started

### 1. Clone & install

```bash
git clone <repo>
cd unifyapis
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in the required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random secret (min 32 chars) |
| `BETTER_AUTH_URL` | Your app URL |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |
| `STRIPE_SECRET_KEY` | Stripe dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard |

### 3. Set up the database

```bash
# Push schema to database
npm run db:push

# Seed initial API data
npm run db:seed
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── app/
│   ├── (auth)/login/         # Login/signup page
│   ├── apis/                 # Public catalog
│   │   └── [slug]/           # API detail page
│   ├── dashboard/            # Protected dashboard
│   │   ├── library/          # Personal API library
│   │   └── settings/         # Account & billing
│   └── api/
│       ├── auth/[...all]/    # Better-Auth handler
│       ├── stripe/checkout/  # Stripe checkout
│       └── trpc/[trpc]/      # tRPC handler
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── shared/               # App-wide components
├── db/
│   ├── schema.ts             # Drizzle schema
│   ├── seed.ts               # Seed data
│   └── index.ts              # DB client
├── lib/
│   ├── auth.ts               # Better-Auth config
│   ├── auth-client.ts        # Client-side auth
│   ├── utils.ts              # Utilities
│   └── trpc/                 # tRPC setup
├── server/
│   ├── root.ts               # App router
│   └── routers/
│       ├── apis.ts           # Public API catalog
│       ├── userApis.ts       # Personal library
│       └── ai.ts             # Groq AI features
└── types/
    └── index.ts              # Shared types
```

## Database Commands

```bash
npm run db:generate   # Generate migration files
npm run db:migrate    # Run migrations
npm run db:push       # Push schema (dev)
npm run db:seed       # Seed initial data
npm run db:studio     # Open Drizzle Studio
```

## Deployment

### Vercel + Render/Fly.io

1. Push to GitHub
2. Connect repo to Vercel
3. Set all env variables in Vercel dashboard
4. Provision PostgreSQL on Render or Fly.io
5. Run `npm run db:push && npm run db:seed` against production DB

## License

MIT
