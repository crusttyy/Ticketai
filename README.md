# TicketPilot (App)

This repo contains the **TicketPilot application** (auth + inbox + AI pipeline scaffolding).

## Local setup

1) Install deps

```bash
npm install
```

2) Configure env

- Copy `.env.example` → `.env.local`
- Fill:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3) Create database schema

- In Supabase SQL editor, run `supabase/schema.sql`.

4) Create an organization + membership (MVP)

- Insert a row into `public.organizations`
- Insert a row into `public.organization_members` for your `auth.users.id`

5) Run dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## What’s implemented so far

- Supabase auth (magic link + password)
- Protected `/app/*` routes
- `/app/inbox` lists tickets for your first org membership

## Next steps

- Email ingestion (IMAP first; Gmail OAuth later)
- Ticket detail view + AI suggestion generation
- Auto-send low-risk replies + review queue

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
