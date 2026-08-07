# Icetropez.Vest

A production-ready investment platform built with Next.js, React, TypeScript, Tailwind CSS, and Supabase (PostgreSQL).

## Features

- **Authentication** — Email/password registration, login, logout, forgot/reset password, role-based access (user/admin)
- **Landing Page** — Hero, features, about, investment overview, FAQ, contact, footer with dark mode and animations
- **User Dashboard** — Wallet overview with charts, profile, notifications, transaction history
- **Deposits** — Minimum R80, unique payment reference, bank details from settings, proof of payment upload, admin approval workflow
- **Withdrawals** — Request with bank details, admin approval, history, notifications
- **Investment Module** — Admin-configurable plans (min/max, duration, return rate, daily or maturity earnings), earnings calculation, days remaining, status tracking, investment history
- **Referral System** — Unique referral code, shareable link, referral dashboard, earnings tracking, admin-configurable percentage
- **Admin Dashboard** — Overview with stats, user management, deposit/withdrawal approval, investment plan management, settings, reports with CSV export, announcements, audit logs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes (Node.js) |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (JWT, bcrypt) |
| Storage | Supabase Storage |
| Charts | Recharts |
| Icons | Lucide React |
| Validation | Zod |
| Testing | Vitest, Testing Library |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install --legacy-peer-deps
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)

### Database

The database schema is managed via SQL migrations in `supabase/migrations/`. Apply them through the Supabase dashboard or MCP tools.

### Development

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting & Type Checking

```bash
npm run lint
npm run typecheck
```

## Docker

```bash
docker-compose up --build
```

## CI/CD

GitHub Actions workflow in `.github/workflows/ci.yml` runs type checking, linting, tests, and build on every push/PR.

## Project Structure

```
app/                    # Next.js App Router pages
  admin/                # Admin dashboard pages
  auth/                 # Authentication pages
  dashboard/            # User dashboard pages
  api/                  # API route handlers
components/             # Reusable React components
  admin/                # Admin-specific components
  dashboard/            # Dashboard-specific components
  landing/              # Landing page sections
  providers/            # Context providers (auth, theme)
  shared/               # Shared components
  ui/                   # shadcn/ui primitives
lib/                    # Utilities and configuration
  supabase/             # Supabase client factories
hooks/                  # Custom React hooks
types/                  # TypeScript type definitions
supabase/               # Supabase configuration and migrations
  migrations/           # SQL migration files
__tests__/              # Test files
```

## Security

- Row Level Security (RLS) on all database tables
- Service role key used only in server-side API routes
- Input validation with Zod on all forms and API endpoints
- Role-based middleware protection for `/admin` and `/dashboard` routes
- Audit logging for all admin actions

## License

This is an original implementation. All rights reserved.
