# Cozy Bites \u2014 Animated Food & Appetizer E-commerce

Production-ready storefront + admin panel built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Prisma + PostgreSQL**, **NextAuth v5**, **Stripe + PayPal**, **Cloudinary**, **Pusher**, **speakeasy 2FA**, **Nodemailer**, **Zustand**, and **Zod**.

---

## Features

- Animated homepage (parallax hero, word-by-word reveal, staggered product cards, animated stat counters, scroll reveals).
- Full shop, product detail, cart, and checkout with live delivery-charge calculation.
- Delivery zones with areas, per-zone charges, free-delivery thresholds, and admin drag-to-reorder.
- Auth: email + password with 6-digit OTP verification, Google OAuth linking, Remember Me (8h / 30d), brute-force lockout, forgot/reset password.
- Admin panel behind a secret URL path with role checks in middleware **and** every route.
- Admin 2FA (TOTP QR + backup codes), change-password, product image management (Cloudinary), orders, customers, settings.
- Real-time admin order notifications and live stock updates via Pusher.
- Standard API envelope, toast notifications, and loading / empty / error states.

---

## First-run checklist

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
#    then fill in the values (see below)

# 3. Create the database schema
npx prisma migrate dev --name init

# 4. Seed zones, products, and default settings
npx prisma db seed

# 5. Create your admin account + secret admin URL
npx tsx scripts/setup-admin.ts
#    -> enter email
#    -> enter password (min 12 chars, mixed case, number, symbol)
#    -> enter your secret admin URL path

# 6. Start the dev server
npm run dev
```

Then open:

- Storefront: http://localhost:3000
- Admin panel: http://localhost:3000/<your-secret-url>

Locked out? Reset from the terminal:

```bash
npx tsx scripts/reset-admin-password.ts
```

---

## Environment variables

See `.env.example`. Minimum to boot locally: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.
Payments, email, image upload, Google login, and real-time features activate automatically once their
keys are provided (the app degrades gracefully when they're absent).

```
DATABASE_URL, NEXT_PUBLIC_APP_URL
NEXTAUTH_URL, NEXTAUTH_SECRET          # openssl rand -base64 32
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER
NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER
GMAIL_USER, GMAIL_APP_PASSWORD
```

---

## Deployment

- **App**: Vercel (set all env vars in the project settings). Add the Stripe webhook endpoint
  `https://<your-domain>/api/webhooks/stripe`.
- **Database**: Railway PostgreSQL \u2014 copy its connection string into `DATABASE_URL`, then run
  `npx prisma migrate deploy` and `npx prisma db seed`.

---

## Project structure

```
app/                 Routes (public + /[adminPath] admin) and API handlers
components/          UI: layout, product, cart, home, motion, admin
lib/                 prisma, auth, mail, cloudinary, pusher, stripe, paypal, utils, validations
prisma/              schema.prisma + seed.ts
scripts/             setup-admin.ts, reset-admin-password.ts
store/               Zustand cart store
types/               Shared DTOs + next-auth augmentation
middleware.ts        Edge guard for /api/admin/*
```

---

## Admin quick start

1. Log in to the admin panel at your secret URL.
2. Go to **Delivery Zones** \u2192 Add zone \u2192 type area names \u2192 set the charge.
3. At checkout, customers select their area and the delivery charge is added automatically.

---

## Notes

- TypeScript strict mode; all API inputs validated with Zod; passwords hashed with bcrypt (cost 12).
- Admin routes are protected by middleware **and** an explicit role check inside every handler.
- `npm run build` should pass once dependencies are installed and env vars are set.
