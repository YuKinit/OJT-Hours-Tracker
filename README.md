# OJT Hours Tracker (MVP)

Web-based OJT hours tracker with signup/login, setup wizard, and a dashboard that predicts the OJT end date based on:
- total required hours
- hours per day (default 8)
- chosen weekdays
- start date (can be past)

## Tech
- Next.js (App Router) + TypeScript + Tailwind
- Supabase (Auth + Postgres + Row Level Security)

## Setup (Supabase)
1. Create a Supabase project.
2. In **SQL Editor**, run:
   - `supabase/schema.sql`
3. In **Authentication → Providers**, keep **Email** enabled.
4. (Optional) Enable **Google**:
   - Supabase **Authentication → Providers → Google**
   - Add your Google OAuth Client ID/Secret
   - Set Redirect URL(s) in Supabase **Authentication → URL Configuration**:
     - Local: `http://localhost:3000/auth/callback`
     - Production: `https://YOUR_DOMAIN/auth/callback`

## Setup (local)
1. Copy env file:

```bash
cp .env.example .env.local
```

2. Fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; required for permanent account deletion)

3. Install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy (Vercel)
1. Push this folder to GitHub.
2. Import to Vercel.
3. Add the same env vars in Vercel project settings (including `SUPABASE_SERVICE_ROLE_KEY`).
4. In Supabase **Auth → URL Configuration**, set:
   - Site URL = your Vercel domain
   - Redirect URLs include `https://YOUR_DOMAIN/auth/callback`

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
