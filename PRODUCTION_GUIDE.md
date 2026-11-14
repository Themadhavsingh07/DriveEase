# DriveEase – Production Deployment Guide & Operational Runbook 🚀

This document is the authoritative operations manual for deploying, configuring, monitoring, and scaling the **DriveEase Car Rental Booking Portal** in production environments.

---

## 1. System Architecture Overview

```
                                  +------------------------------+
                                  |         End Users            |
                                  | (Browsers, Mobile, Tablet)   |
                                  +--------------+---------------+
                                                 |
                                         HTTPS / TLS 1.3
                                                 |
               +---------------------------------+---------------------------------+
               |                                                                   |
               v                                                                   v
+-------------------------------+                                 +---------------------------------+
|     Frontend (Vercel SPA)     |                                 |    Payment Gateway (Razorpay)   |
|   - React 18 + Vite + TS      |                                 |   - Webhooks (Idempotent)       |
|   - Tailwind CSS + Lucide     |                                 |   - Standard Checkout SDK       |
|   - Code-Split Dynamic Chunks |                                 +----------------+----------------+
|   - robots.txt & sitemap.xml  |                                                  |
+---------------+---------------+                                                  |
                |                                                                  |
                | API Calls via Fetch / JSON                                       | Webhook Events
                v                                                                  v
+----------------------------------------------------------------------------------+----------------+
|                                    Backend REST API (Render / Railway / Docker)                   |
|  - Node.js 20 LTS + Express.js + TypeScript                                                      |
|  - Helmet Security Headers (CSP, HSTS, noSniff, frameguard)                                      |
|  - Dedicated Rate Limiters (Global: 300/15m, Auth: 25/15m, Payments: 40/15m, Webhooks: 150/5m)   |
|  - Health Diagnostics & Monitoring (/api/v1/health)                                              |
|  - Structured Sanitized Logger (Deep secret redaction)                                           |
|  - Nodemailer SMTP Transactional Dispatcher (Non-blocking)                                       |
+--------------------------------------------------+------------------------------------------------+
                                                   |
                                       PostgreSQL 15 / 16 (Prisma ORM)
                                                   |
                          +------------------------+------------------------+
                          |   - Read/Write Connection Pool (limit=10)       |
                          |   - Decimal(10, 2) Financial Accuracy           |
                          |   - Composite Availability Indexing             |
                          |   - Transactional Advisory Locks (Anti-Race)    |
                          +-------------------------------------------------+
```

---

## 2. Environment Configuration Matrix

### 2.1 Backend Environment Variables (`backend/.env`)

| Variable | Required | Description | Production Example |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | Application mode | `production` |
| `PORT` | Yes | HTTP server binding port | `5001` |
| `CLIENT_URL` | Yes | Frontend public origin for CORS | `https://driveease.vercel.app` |
| `DATABASE_URL` | Yes | Managed PostgreSQL URI with connection pool parameters | `postgresql://user:pass@host:5432/driveease?connection_limit=10&pool_timeout=20&sslmode=require` |
| `JWT_ACCESS_SECRET` | Yes | Cryptographic secret for signing access tokens (min 32 chars) | Random 64-char hex string |
| `JWT_REFRESH_SECRET` | Yes | Cryptographic secret for signing refresh tokens (min 32 chars) | Random 64-char hex string |
| `COOKIE_SECRET` | Yes | Secret for signing HTTP-only cookies | Random 64-char hex string |
| `ACCESS_TOKEN_EXPIRY`| No | Access token lifespan | `15m` |
| `REFRESH_TOKEN_EXPIRY`| No| Refresh token lifespan | `7d` |
| `RAZORPAY_KEY_ID` | Yes | Razorpay API Key ID (test or live) | `rzp_live_...` or `rzp_test_...` |
| `RAZORPAY_KEY_SECRET`| Yes | Razorpay API Secret | Secret from Razorpay Dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | Razorpay Webhook HMAC secret | Webhook secret configured in Razorpay |
| `SMTP_HOST` | No | SMTP mail relay server | `smtp.sendgrid.net` |
| `SMTP_PORT` | No | SMTP port | `587` |
| `SMTP_USER` | No | SMTP username | `apikey` |
| `SMTP_PASS` | No | SMTP password / API token | SendGrid / AWS SES password |
| `EMAIL_FROM` | No | Display from address | `"DriveEase Concierge <no-reply@driveease.com>"` |
| `BOOKING_HOLD_MINUTES` | No | Lock duration for checkout hold | `10` |
| `TAX_RATE` | No | Applicable GST tax percentage | `0.18` (18% GST) |

### 2.2 Frontend Environment Variables (`frontend/.env.production`)

| Variable | Required | Description | Production Example |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | Yes | Backend REST API endpoint base | `https://driveease-api.onrender.com/api` |
| `VITE_RAZORPAY_KEY_ID`| Yes | Public client-side Razorpay Key ID | `rzp_test_DriveEaseTestKey123` |

---

## 3. Step-by-Step Production Deployment

### 3.1 Deploying the Backend on Render

1. **Create Managed Database:**
   - In Render dashboard, click **New +** -> **PostgreSQL**.
   - Name: `driveease-db`, Database: `driveease`, Region: `Oregon (US West)` or closest to your audience.
   - Copy the **Internal Database URL** for services in Render, or **External Database URL** for local migrations.

2. **Deploy Web Service:**
   - Click **New +** -> **Web Service** and connect your GitHub repository.
   - Set **Root Directory** to `backend`.
   - **Environment:** `Node`.
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `node dist/server.js`
   - **Health Check Path:** `/api/v1/health`

3. **Configure Environment Variables:**
   - Paste all backend production variables documented above in Section 2.1 into the Render Environment tab.

4. **Run Database Migrations & Seeds:**
   - From Render Shell (or locally pointing to production `DATABASE_URL`):
     ```bash
     npx prisma db push
     npm run prisma:seed
     ```

### 3.2 Deploying the Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your repository.
3. Configure the Project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Set Environment Variables:
   - `VITE_API_URL`: `https://driveease-api.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID`: `rzp_test_DriveEaseTestKey123`
5. Click **Deploy**. Vercel will automatically apply routing and caching rules from `frontend/vercel.json`.

---

## 4. Health Checks, Monitoring & Alerting

### Health Endpoint Diagnostic

The health endpoint is accessible without authentication:
```bash
curl -i https://driveease-api.onrender.com/api/v1/health
```

Sample Healthy Response (HTTP 200 OK):
```json
{
  "success": true,
  "status": "healthy",
  "message": "DriveEase API is fully operational",
  "environment": "production",
  "version": "1.0.0",
  "uptimeSeconds": 86420,
  "timestamp": "2026-11-14T17:15:00.000Z",
  "services": {
    "api": "operational",
    "database": "healthy",
    "databaseLatencyMs": 4
  },
  "system": {
    "memoryUsedMB": 42,
    "memoryTotalMB": 85,
    "nodeVersion": "v20.18.0"
  },
  "responseTimeMs": 6
}
```

If database connectivity drops, it immediately responds with `HTTP 503 Service Unavailable`, allowing uptime monitors (UptimeRobot, BetterUptime, Datadog) to alert operations.

---

## 5. Security Checklist & Hardening Measures

- [x] **Helmet Security Headers:** Content-Security-Policy (CSP), HSTS (1 year + preload), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Cross-Origin-Resource-Policy: cross-origin`.
- [x] **Cookie Security:** Cookies set with `httpOnly: true`, `secure: true` in production, `sameSite: 'none'` (cross-site SPA API) or `'lax'`.
- [x] **Strict Rate Limiting:**
  - Dedicated limiter on `/api/v1/auth/login` and `/api/v1/auth/register` (max 25 per 15 min).
  - Dedicated limiter on `/api/v1/payments/*` (max 40 per 15 min).
  - Dedicated limiter on `/api/v1/payments/webhook` (max 150 per 5 min).
  - Global API limiter (max 300 per 15 min).
- [x] **Input Validation:** Zod schemas across all incoming bodies, parameters, and query strings.
- [x] **Structured Logging:** Deep sanitization of all sensitive tokens, passwords, credit card numbers, and HMAC signatures.
- [x] **Database Isolation:** Customer queries strictly filtered by authenticated `req.user.id`; admin routes protected by `requireRole('ADMIN')` and IP-tracked audit logs.
- [x] **Advisory Lock Concurrency:** PostgreSQL advisory locks in `BookingConflictService.assertCarAvailable` eliminate race conditions during simultaneous customer checkouts.

---

## 6. Backup & Disaster Recovery Runbook

### 6.1 Database Backup (PostgreSQL `pg_dump`)

To take an instant full snapshot of the production database:
```bash
pg_dump "$DATABASE_URL" \
  --format=custom \
  --compress=9 \
  --file="driveease_backup_$(date +%Y%m%d_%H%M%S).dump"
```

### 6.2 Database Restoration (`pg_restore`)

To restore from a backup file:
```bash
pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --dbname="$DATABASE_URL" \
  driveease_backup_YYYYMMDD_HHMMSS.dump
```

---

## 7. Razorpay Live Gateway Transition

To switch from test mode to live transactions:
1. Complete Razorpay KYC and activate your Live Account in the Razorpay Dashboard.
2. In Razorpay Dashboard -> **Settings** -> **API Keys**, generate a **Live Key ID** (`rzp_live_...`) and **Key Secret**.
3. In Razorpay Dashboard -> **Settings** -> **Webhooks**, add webhook URL:
   `https://driveease-api.onrender.com/api/v1/payments/webhook`
   - Select events: `payment.captured`, `order.paid`, `payment.failed`, `refund.processed`.
   - Set Secret: match your `RAZORPAY_WEBHOOK_SECRET`.
4. Update backend environment variables with live credentials and redeploy.
5. Update frontend `VITE_RAZORPAY_KEY_ID` with `rzp_live_...` and trigger frontend redeploy.
