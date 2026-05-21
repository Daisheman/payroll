# Payroll SaaS

Production-oriented multi-tenant payroll web platform built with Next.js 15, NestJS, PostgreSQL, Prisma, JWT auth, RBAC, Swagger, Docker, and a responsive enterprise dashboard.

## Stack

- Frontend: Next.js 15 App Router, TypeScript, TailwindCSS, shadcn-style UI primitives
- Backend: NestJS REST API, Prisma ORM, PostgreSQL, Swagger
- Security: Argon2 password hashing, JWT access/refresh rotation, RBAC, tenant guards, CSRF token flow, rate limiting, Helmet/CSP, Zod and class-validator validation
- Payroll: Tanzania PAYE, NSSF, SDL, WCF, overtime, bonus, gratuity, leave deductions, severance, YTD support
- Reports: PDF and Excel exports for payslips, summaries, statutory schedules, tax certificates

## Quick Start

1. Copy `.env.example` to `.env`.
2. Run `docker compose up --build`.
3. API: `http://localhost:4000/api/docs`
4. Web: `http://localhost:3000`

## Local Development

```bash
npm install
npm run db:migrate
npm run dev
```

Seed credentials are created by `npm run db:seed`:

- Company slug: `demo`
- Admin email: `admin@demo.co.tz`
- Password: `ChangeMe123!`

## Deployment

See [deploy/DEPLOYMENT.md](deploy/DEPLOYMENT.md).
