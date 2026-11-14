# DriveEase – Advanced Car Rental Booking Portal 🚗⚡

**DriveEase** is an enterprise-grade, full-stack luxury car rental booking portal engineered for seamless automotive discovery, authoritative date-wise availability, dynamic price calculations, multi-tier protection plans, end-to-end reservation management, Razorpay payment gateway integration, cryptographic verification, official PDF tax invoice generation, and administrative fleet operations.

Built with **React 18 + Vite + TypeScript + Tailwind CSS** on the frontend, and **Node.js + Express + TypeScript + Prisma ORM + PostgreSQL** on the backend.

---

## 📸 Key Features & Capabilities

### 1. 🗓️ Live Date-Wise Availability Calendar
- **Atomic Database-Level Conflict Detection:** Overlapping booking queries prevent double bookings even under concurrent race conditions.
- **Dynamic Calendar Visualizer:** Visualizes available dates, reserved/booked slots (blocked in red with line-through), and user-selected date ranges.
- **Strict Business Rules:** Validates that return date/time is after pickup date/time, forbids past dates, and enforces vehicle-specific minimum/maximum rental days.

### 2. 🧮 Authoritative Dynamic Price Calculator
- **Backend-Enforced Calculations:** Server-side engine recalculates all rates authoritatively (never trusting client-side price totals).
- **Itemized Price Breakdown:**
  - Base rental amount (`Daily Price × Rental Days`)
  - Damage Protection Tiers (`Basic ₹0`, `Premium ₹500/day`, `Comprehensive ₹800/day`)
  - Optional Add-on Amenities (Child Safety Seat, GPS Satellite Nav, Additional Driver, 5G Wi-Fi, Post-Rental Cleaning)
  - Applicable Taxes (`18% GST` on taxable subtotal)
  - Promotional Coupons (Percentage with caps or flat discounts e.g. `DRIVE10`, `WELCOME500`)
  - 100% Refundable Security Deposit (Clearly segregated from rental charges)
  - Final Grand Payable Total

### 3. 🚙 Fleet Discovery & Catalog Module (Phase 2 Enhanced)
- **Centralized Mock Dataset:** 14 realistic Indian market vehicles across 9 key brands (Maruti Suzuki, Hyundai, Kia, Mahindra, Toyota, BMW, Mercedes-Benz, Tata, Honda, Porsche, Tesla) with multiple high-resolution photos, powertrain specs, highlights, and policies.
- **Dual View Modes:** Smooth toggle between **Grid View** and **List View**.
- **Real-Time Multi-Dimensional Filtering:**
  - Full-text search by car brand, model, body style, and fuel type with instant debounce and clear button (`VehicleSearch`).
  - Category selector (Hatchback, Sedan, SUV, Luxury, Electric, Sports).
  - Price Range Slider (₹1,800 to ₹30,000+/day in INR).
  - Fuel Type (Petrol, Diesel, Electric, Hybrid, CNG).
  - Transmission (Automatic, Manual).
  - Minimum Seating Capacity (2+, 4+, 5+, 7+ seats).
  - Automotive Brand filter (Maruti Suzuki, Hyundai, Kia, Mahindra, Toyota, BMW, Mercedes-Benz, Tata, Honda).
  - Availability filter (Available Only vs All Vehicles).
  - Wishlist / Saved Only filter toggle.
  - Removable active filter chips with 1-click "Clear All Filters".
- **Sorting Options:** Recommended & Featured, Price: Low to High, Price: High to Low, Newest First, Highest Rated, Most Popular.
- **Wishlist / Favourites System:**
  - Interactive heart button (`WishlistButton`) on vehicle cards, detail headers, and navigation bar.
  - Seamless persistence across sessions via `localStorage` (`driveease_wishlist`).
- **Vehicle Details Page (`/cars/:id`):**
  - Hierarchical breadcrumbs (`Home > Explore Cars > Vehicle Name`).
  - Interactive Multi-Image Gallery (`VehicleGallery`) with clickable thumbnails and Fullscreen Lightbox Modal with keyboard controls.
  - Technical Specifications Grid (`VehicleSpecifications`) displaying powertrain, dimensions, output, luggage, and doors.
  - Features & Amenities checklist with modern icons.
  - Detailed Overview, Engineering Highlights, and Recommended Usage Scenarios.
  - Rental Policies (Refundable Deposit, Mileage Policy, Fuel Policy, Cancellation, Hub Handover).
  - Sticky Interactive Booking Preview Panel with interactive pickup & return date pickers, duration calculation, damage protection selector, and itemized cost breakdown.
  - 1-Click "Continue to Booking" navigating directly to `/booking/checkout`.

### 4. 💳 Multi-Step Booking & Checkout Flow (`/booking/checkout`)
- **Step 1: Itinerary Review**: Selected car preview, pickup & return date/time, and hub locations.
- **Step 2: Driver Details**: Primary driver full name, email, phone number, driving license number, and special flight/arrival notes (auto-populated from authenticated profile).
- **Step 3: Protection & Add-ons**: Selection of protection tiers (Basic, Premium Zero-Dep ₹500/day, Comprehensive Shield ₹800/day) and live add-on services (GPS, Child Seat, etc.).
- **Step 4: Review & Coupon**: Authoritative live calculation from server, voucher coupon code application, and deposit segregation.
- **Step 5: Payment & Reservation Hold**: Temporary 10-minute booking hold with advisory locks (`POST /api/v1/bookings/hold`), live countdown timer widget, Razorpay checkout with cryptographic HMAC-SHA256 signature verification, and automated confirmation redirect.

### 5. 🧾 Booking Confirmation & Official Tax Invoices (`/booking/confirmation/:reference`)
- **Celebration Banner**: Confetti celebration, official booking reference code, and verified payment badge.
- **PDF Tax Invoice Generation**: Real-time PDF generator using PDFKit and embedded QR verification code (`GET /api/v1/bookings/:id/invoice`).
- **Itemized Breakdown**: Transparent line items for base vehicle rental, damage waiver, add-ons, 18% GST, and highlighted 100% refundable security deposit.

### 6. 👤 Advanced Customer Dashboard & Profile Management (`/dashboard`)
- **Authoritative Trip Statistics:** Real database-driven KPI statistics cards (Total Reservations, Upcoming Trips, Active On-Road Rentals, Completed Journeys, Cancelled Bookings).
- **Interactive Reservations Ledger:** Filter by status (`ALL`, `UPCOMING`, `ACTIVE`, `COMPLETED`, `CANCELLED`), live client search by reference, vehicle, or pickup location, and price/date sorting.
- **Dedicated Booking Details Page (`/dashboard/bookings/:id`):** Complete itinerary, vehicle specs & photos, itemized pricing breakdown, payment receipt, cancellation/refund status, visual status progress timeline, and one-click PDF tax invoice download.
- **Driver Profile & Identity Document Management (`/dashboard/profile`):**
  - Personal contact details update and secure password change.
  - Multi-image driving license upload (front & back images) via private disk storage with Multer.
  - Real-time document verification status tracking (`PENDING`, `VERIFIED`, `REJECTED` with concave feedback reasons).
  - Secure authenticated stream viewer (`/api/v1/users/documents/:id/file?side=front|back`).
- **In-App Notifications Engine:** Unread alert badge in navigation, interactive notifications drawer, mark single/all as read, and automated alerts for bookings, cancellations, and license reviews.
- **Cancellation & Automated Refund Engine:**
  - Real-time policy evaluation: > 24 hours prior to pickup = 100% refund of rental and deposit (0% fee).
  - < 24 hours prior to pickup = 80% refund of rental portion, 100% refund of security deposit (20% late fee).
  - Automated `Refund` ledger tracking.

### 7. 🛡️ Enterprise Admin Management System (`/admin`)
- **Executive KPI Dashboard (`/admin/dashboard` & `/admin`):**
  - Real-time database metrics: **Paid Rental Revenue** (strictly isolates earned hire revenue from refundable deposits), Gross Collections, Active Deposits Held, Taxes Collected, Fleet Utilization Rate (%), Total Bookings, Customers, and Active Rentals.
  - 6-Month Monthly Revenue & Volume Trends, 7-Day Trailing Daily Revenue Velocity, Booking Status Breakdown, and Popular Vehicle Category Rankings.
- **Fleet Inventory Control (`/admin/cars`):**
  - Full-featured fleet inventory table with Category, Fuel Type, Transmission, and Status filters.
  - **Soft Activation / Deactivation Toggle:** Soft-toggle vehicles (`isActive` & `isAvailable`) without corrupting historical booking records or price snapshots.
  - Add & Edit Luxury Vehicle modals supporting specs, multi-image URLs, deposit, and features.
- **Customer Directory & Document Reviewer (`/admin/customers`):**
  - Customer directory with search and status filters (`ACTIVE`, `SUSPENDED`, `BLOCKED`).
  - Account status update modal with required audit reason logged in `AuditLog`.
  - Customer details modal with full booking history, spend analytics, and submitted driving license reviewer (stream front & back images via authenticated stream URLs, Approve or Reject with mandatory reason and customer notification).
- **Booking Master Control (`/admin/bookings`):**
  - Master reservations ledger with search, multi-status filters, payment status, and pagination.
  - Authorized status transitions (`CONFIRMED` -> `ACTIVE` -> `COMPLETED`, `CANCELLED`) with audit justification modal.
- **Revenue Analytics & Compliance Reports (`/admin/analytics`):**
  - Date-range filtered revenue analytics, rental duration metrics, and vehicle rankings.
  - 1-Click CSV Report Exports:
    - `Export Bookings Report (CSV)`
    - `Export Revenue Report (CSV)`
    - `Export Fleet Utilization (CSV)`
- **Business Configuration (`/admin/settings`):**
  - Dynamic platform business settings editor: Business Name, Support Email, Phone, Headquarters Address, Currency, Timezone, Tax Rate, Hold Duration, and Cancellation Refund Policy.
- **Immutable Security & Audit Trail (`/admin/audit-logs`):**
  - Comprehensive audit log viewer recording admin actions, entity types, IDs, IP addresses, timestamps, and sanitized change details.

### 8. 🚀 Production Readiness, Security Hardening & Launch (Phase 7)
- **Route-Based Code Splitting:** `React.lazy` and `Suspense` with custom page loaders reduce initial bundle weight to < 165 kB (eliminating the >500 kB Vite bundle warning).
- **Production Security Headers (Helmet):** Full Content Security Policy (CSP), HTTP Strict Transport Security (HSTS 1-year + preload), `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`.
- **Multi-Tier Rate Limiting:**
  - Dedicated Auth limiter (`/api/v1/auth/*` max 25 req/15m)
  - Dedicated Payment limiter (`/api/v1/payments/*` max 40 req/15m)
  - Dedicated Webhook limiter (`/api/v1/payments/webhook` max 150 req/5m)
  - Global API limiter (300 req/15m)
- **Health & Diagnostic Monitoring:** `GET /api/v1/health` with real-time PostgreSQL database check (`SELECT 1;`), latency measurement, memory usage metrics, and zero secret leakage.
- **Structured Sanitized Logging:** Redacts nested sensitive keys (`password`, `token`, `secret`, `credit_card`, `authorization`) across application and HTTP logs.
- **Legal & Customer Trust Center:** Dedicated pages for `/privacy` (DPDP Act compliant), `/terms` (Rental Terms), `/cancellation-policy` (Transparent 24h refund matrix), `/faq` (Interactive Accordion), and `/guidelines` (Trust & Safety Handover Guide).
- **SEO & Discovery:** Full Open Graph tags, Twitter Cards, canonical links, `robots.txt` (blocking `/dashboard` and `/admin` from crawlers), and XML sitemap (`/sitemap.xml`).
- **Containerization & CI/CD:** Multi-stage production `Dockerfile` (Node 20 Alpine, non-root user), `render.yaml` deployment blueprint, `vercel.json` SPA routing headers, and GitHub Actions CI workflow (`.github/workflows/ci.yml`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, TanStack Query v5, React Router DOM v6, Lucide React, Code-Split Dynamic Chunks |
| **Backend** | Node.js 20 LTS, Express.js, TypeScript, REST Architecture, Prisma ORM, JWT, BcryptJS, Cookie-Parser, Helmet, Morgan, Express-Rate-Limit, Nodemailer, Razorpay, PDFKit, QRCode |
| **Database** | PostgreSQL 15/16 with normalized relational schema (16 entities including `CouponUsage`, `Refund`, `Invoice`, `BookingStatusHistory`, `holdExpiresAt`), advisory locking |
| **Testing** | Vitest, Supertest (92 passing unit, integration, concurrency & production security tests across 13 suites) |
| **Deployment** | Vercel (Frontend SPA), Render / Railway / Docker (Backend API), Managed PostgreSQL |

---

## 🗄️ Database Architecture (Prisma Models)

The PostgreSQL database is organized into 16 relational models:

1. **`User`** – Authentication, role (`CUSTOMER`, `ADMIN`), profile details (`firstName`, `lastName`, `phone`, `avatar`, `isActive`), driving license number.
2. **`RefreshToken`** – Refresh token rotation tracking, hashed token (`tokenHash`), expiration date, revoked status, user foreign key.
3. **`CarCategory`** – Vehicle categories (Hatchback, Sedan, SUV, Luxury, Electric, Sports).
4. **`Car`** – Fleet specifications, powertrain, mileage, seats, daily rate, security deposit, features array, locations, ratings, review counts.
5. **`CarImage`** – Multi-angle gallery images with primary photo indicator and display order.
6. **`Booking`** – Unique reference code (`DE-2026-XXXX`), dates, rental days, calculated costs, driver info, booking & payment status, `holdExpiresAt`, `dailyRateSnapshot`, `baseAmount`, `insuranceAmount`, `additionalServiceAmount`, `rentalSubtotal`, `securityDeposit`, `cancellationFee`, `refundAmount`.
7. **`Payment`** – Gateway transaction ID, amount, method (`RAZORPAY`, `CASH_ON_PICKUP`), payment status, `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`.
8. **`Coupon`** – Discount codes (`DRIVE10`, `WELCOME500`, `LUXURY20`), discount type, min booking amount, max discount cap, usage limit, times used.
9. **`CouponUsage`** – Per-user coupon redemption tracking table (`couponId`, `userId`, `bookingId`, `discountAmount`).
10. **`Refund`** – Gateway and system refund records (`bookingId`, `paymentId`, `amount`, `status`, `reason`, `razorpayRefundId`, `processedAt`).
11. **`Invoice`** – Official tax invoices (`invoiceNumber`, `bookingId`, `userId`, `subtotal`, `taxAmount`, `securityDeposit`, `totalAmount`, `status`, `issuedAt`).
12. **`BookingStatusHistory`** – Audit trail of all state transitions (`bookingId`, `fromStatus`, `toStatus`, `reason`, `changedBy`, `createdAt`).
13. **`Review`** – Customer feedback, star rating, verified rental badge.
14. **`AdditionalService`** – Optional add-on amenities (Child Seat, GPS, Additional Driver, Wi-Fi, Cleaning).
15. **`BookingService`** – Many-to-many junction table for applied booking amenities.
16. **`Notification`** – In-app alerts for reservations, confirmations, and administrative notices.
17. **`UserDocument`** – Customer driving license documents & private storage paths (`userId`, `documentType`, `documentNumber`, `expiryDate`, `frontImagePath`, `backImagePath`, `verificationStatus`, `rejectionReason`, `verifiedAt`, `verifiedBy`).
18. **`AuditLog`** – Immutable administrative audit trail (`adminId`, `adminEmail`, `action`, `entityType`, `entityId`, `details`, `ipAddress`, `userAgent`).
19. **`BusinessSetting`** – Dynamic business parameters (`key`, `value`, `category`, `description`, `isPublic`, `updatedBy`).

---

## 🔌 Core REST API Endpoints Overview

All endpoints are accessible via both `/api/v1` (canonical) and `/api` (backward compatibility).

| Method | Endpoint | Description | Access Control |
|---|---|---|---|
| `GET` | `/api/v1/health` | Health check & service status | Public |
| `POST` | `/api/v1/auth/register` | Register new customer account | Public (Rate Limited) |
| `POST` | `/api/v1/auth/login` | Authenticate & issue HTTP-only cookies | Public (Rate Limited) |
| `POST` | `/api/v1/auth/refresh` | Rotate refresh token & grant new access token | Public (Cookie / Body) |
| `POST` | `/api/v1/auth/logout` | Revoke session & clear HTTP-only cookies | Authenticated |
| `GET` | `/api/v1/auth/me` | Fetch currently authenticated user session | Authenticated |
| `GET` | `/api/v1/users/profile` | Get customer profile details | Authenticated |
| `PATCH` | `/api/v1/users/profile` | Update profile (name, phone, driving license) | Authenticated |
| `GET` | `/api/v1/users/documents` | Get authenticated customer's documents | Authenticated |
| `POST` | `/api/v1/users/documents` | Upload front/back driving license (Multer private storage) | Authenticated |
| `GET` | `/api/v1/users/documents/:id/file` | Authenticated stream of private document image | Owner or Admin |
| `DELETE` | `/api/v1/users/documents/:id` | Delete driving license document & cleanup disk | Owner or Admin |
| `GET` | `/api/v1/dashboard/overview` | Customer overview stats, verification & recent bookings | Authenticated |
| `GET` | `/api/v1/dashboard/bookings` | Customer bookings with search, filters & pagination | Authenticated |
| `GET` | `/api/v1/dashboard/notifications` | Customer notifications list with unread counter | Authenticated |
| `PATCH` | `/api/v1/dashboard/notifications/:id/read` | Mark single notification as read | Authenticated |
| `PATCH` | `/api/v1/dashboard/notifications/read-all` | Mark all customer notifications as read | Authenticated |
| `GET` | `/api/v1/cars` | Search & filter fleet with pagination & sorting | Public |
| `GET` | `/api/v1/cars/:id` | Get full vehicle specifications, images, and reviews | Public |
| `POST` | `/api/v1/pricing/calculate` | Authoritative server-side price calculation with GST & deposit | Public / Authenticated |
| `POST` | `/api/v1/coupons/validate` | Validate coupon code & calculate discount | Public / Authenticated |
| `GET` | `/api/v1/services` | Retrieve available in-cabin amenities & add-ons | Public |
| `POST` | `/api/v1/bookings/hold` | Create 10-minute temporary booking hold with advisory lock | Authenticated |
| `POST` | `/api/v1/bookings/:id/confirm`| Confirm booking after payment verification | Authenticated |
| `GET` | `/api/v1/bookings/my` | Get customer booking history with status filter | Authenticated |
| `GET` | `/api/v1/bookings/:id` | Get detailed booking information | Authenticated |
| `GET` | `/api/v1/bookings/reference/:ref`| Get booking by bookingNumber/reference | Authenticated |
| `GET` | `/api/v1/bookings/:id/invoice`| Download official tax invoice PDF with QR code | Authenticated |
| `PATCH` | `/api/v1/bookings/:id/cancel`| Cancel booking with cancellation policy & refund calculation | Authenticated |
| `POST` | `/api/v1/payments/create-order`| Create Razorpay order for booking | Authenticated |
| `POST` | `/api/v1/payments/verify` | Verify cryptographic Razorpay HMAC-SHA256 signature | Authenticated |
| `POST` | `/api/v1/payments/webhook` | Idempotent Razorpay Webhook processor | Public (Signature Verified) |
| `GET` | `/api/v1/admin/dashboard` | Executive KPI overview, charts & revenue trends | Admin Only |
| `GET` | `/api/v1/admin/analytics` | Detailed revenue breakdown & vehicle rankings | Admin Only |
| `GET` | `/api/v1/admin/reports/export` | 1-Click CSV export (bookings, revenue, utilization) | Admin Only |
| `GET` | `/api/v1/admin/cars` | Admin fleet list with status & search | Admin Only |
| `POST` | `/api/v1/admin/cars` | Create luxury vehicle with images & specs | Admin Only |
| `PATCH` | `/api/v1/admin/cars/:id` | Edit vehicle details and rental rates | Admin Only |
| `PATCH` | `/api/v1/admin/cars/:id/status` | Soft-toggle vehicle active & available status | Admin Only |
| `GET` | `/api/v1/admin/customers` | Registered customer directory with search & status filters | Admin Only |
| `GET` | `/api/v1/admin/customers/:id` | Customer details, bookings, payments & license review | Admin Only |
| `PATCH` | `/api/v1/admin/customers/:id/status` | Set customer account status (ACTIVE/SUSPENDED/BLOCKED) | Admin Only |
| `PATCH` | `/api/v1/admin/documents/:id/status` | Verify or reject customer driving license with reason | Admin Only |
| `GET` | `/api/v1/admin/bookings` | Admin fleet bookings list with search & status filters | Admin Only |
| `PATCH` | `/api/v1/admin/bookings/:id/status`| Transition booking status with audit history | Admin Only |
| `GET` | `/api/v1/admin/settings` | Retrieve configurable business settings | Admin Only |
| `PATCH` | `/api/v1/admin/settings` | Update business settings with audit log | Admin Only |
| `GET` | `/api/v1/admin/audit-logs` | Retrieve paginated security audit trail logs | Admin Only |

---

## ⚡ Concurrency & Availability Architecture

### 1. Database-Level Conflict Detection
- **Half-Open Reservation Intervals**: `[pickupDateTime, returnDateTime)`.
- **Overlap Formula**:
  `existingPickup < requestedReturn AND (existingReturn + turnaroundBuffer) > requestedPickup`
- **Status Rules**:
  - `CONFIRMED`: Always blocks availability.
  - `ACTIVE`: Always blocks availability.
  - `PENDING`: Blocks **only** when `holdExpiresAt > now` (or default 10m hold). Expired pending holds are automatically bypassed.
  - `COMPLETED` & `CANCELLED`: Never block availability.

### 2. Transaction-Safe Advisory Locking (`assertCarAvailable`)
- Employs PostgreSQL transaction-level advisory locks scoped to the vehicle ID:
  ```sql
  SELECT pg_advisory_xact_lock(hashtext(carId)::bigint);
  ```
- Prevents race conditions and double-bookings when multiple customers attempt simultaneous reservations on the same vehicle.
- Automatically releases when the transaction commits or aborts.

---

## 🚀 Quick Start & Setup Instructions

### 1. Prerequisites
- **Node.js** v18+ (Node v20 or v22 recommended)
- **PostgreSQL** running locally or via remote host

### 2. Database Migration & Seeding
From the root directory or `backend/`:
```bash
# Sync Prisma schema to PostgreSQL
cd backend
npx prisma db push

# Seed realistic luxury fleet, categories, coupons, demo users & sample bookings
npm run prisma:seed
```

### 3. Running the Development Servers
From the root workspace:
```bash
# Start both backend and frontend concurrently
npm run dev

# Or run separately:
npm run dev:backend   # Express API server at http://localhost:5001
npm run dev:frontend  # Vite React App at http://localhost:3000
```

### 4. Running Automated Tests
```bash
npm run test
# or
cd backend && npm test
```
Runs 87 comprehensive Vitest tests across 12 test suites verifying:
1. `tests/adminPhase6.test.ts`: Executive overview (strictly segregating earned rental revenue from security deposits), monthly & daily trends, soft car activation toggle, customer account status changes, settings update, and CSV exports (`bookings`, `revenue`, `utilization`).
2. `tests/dashboard.test.ts`: Customer overview KPI stats, booking queries with status filters & search, notification creation, read status, and mark-all-read.
3. `tests/document.test.ts`: Driving license upload, private disk storage metadata, authenticated streaming security (owner/admin allowed, unauthorized 403), admin verification review, and document deletion with disk file cleanup.
4. `tests/pricing.test.ts`: Single-day, multi-day, insurance tiers, add-ons, percentage & fixed coupons, 18% GST, and refundable security deposit.
5. `tests/booking.test.ts`: 10-minute hold creation, concurrency lock conflict prevention, confirmation, status history audit trail, free cancellation (>24h), and late cancellation (<24h).
6. `tests/payment.test.ts`: Razorpay HMAC-SHA256 signature verification, webhook signature validation, tampered signature rejection, and idempotent confirmations.
7. `tests/invoice.test.ts`: Authentic PDF generation with binary `%PDF-` header, embedded QR verification code, and customer authorization guard.
8. `tests/availability.test.ts`: Date-wise availability checking and calendar visualizer queries.
9. `tests/bookingConflict.test.ts`: Concurrency protection and PostgreSQL advisory lock guard.
10. `tests/auth.test.ts`: Authentication, registration, login, token rotation, and RBAC guards.
11. `tests/car.test.ts`: Fleet query, multi-parameter filtering, and car details.
12. `tests/api.test.ts`: Core utility calculation and date range overlapping formulas.

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email Address | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@driveease.com` | `admin123` | Full access to Admin Console, Fleet CRUD, All Bookings, Analytics |
| **Customer** | `customer@driveease.com` | `password123` | Personal Dashboard, Booking History, Active Rentals, Invoices |
| **Secondary Customer** | `priya.sharma@example.com` | `password123` | Customer reservations & reviews |

> 💡 **Tip:** The navigation bar and login page feature a **"Demo: Customer / Admin"** 1-click button for effortless instant role switching and review!

---

## 🏷️ Pre-Seeded Test Coupons

- **`DRIVE10`**: 10% discount on rentals above ₹2,000 (Capped at ₹1,500).
- **`WELCOME500`**: Flat ₹500 instant discount on rentals above ₹3,000.
- **`LUXURY20`**: 20% discount on prestige reservations above ₹8,000 (Capped at ₹5,000).

---

## 📄 License
This project is open-source and distributed under the MIT License.
