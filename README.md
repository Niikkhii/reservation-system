# Inventory Reservation System

A full-stack inventory reservation system built with Next.js, Prisma, PostgreSQL (Supabase), and Tailwind CSS.

This project was built as part of the Allo Engineering Take-Home Exercise.

---

# Problem Statement

In large-scale ecommerce systems, multiple customers may attempt to purchase the same inventory simultaneously.

If stock is decremented only after payment completion, overselling can occur due to payment delays (UPI redirects, 3DS flows, wallet confirmations, etc.).

This system solves that problem using temporary inventory reservations.

When a customer proceeds to checkout:
- inventory is temporarily reserved
- stock becomes unavailable to others
- reservation expires automatically after a fixed time window
- if payment succeeds → reservation is confirmed
- if payment fails or expires → stock is released back

---

# Features

## Backend
- Product inventory management
- Multi-warehouse stock support
- Reservation lifecycle management
- Atomic reservation transactions
- Automatic reservation expiry cleanup
- Proper concurrency-safe stock reservation
- REST APIs using Next.js App Router
- Prisma ORM with Supabase PostgreSQL

---

## Frontend
- Product listing page
- Warehouse-wise stock display
- Reserve inventory
- Active reservation panel
- Live countdown timer
- Confirm reservation
- Release reservation
- Reservation history
- Auto-refresh inventory updates
- Responsive UI using Tailwind CSS

---

# Tech Stack

## Frontend
- Next.js 16 (App Router)
- React
- TypeScript
- Tailwind CSS

## Backend
- Next.js Route Handlers
- Prisma ORM
- PostgreSQL (Supabase)

## Database
- Supabase Hosted PostgreSQL

## Scheduling
- node-cron

---

# Architecture Overview

## Inventory Model

Each inventory record contains:

- totalStock
- reservedStock

Available stock is calculated as:

```ts
availableStock =
totalStock - reservedStock
```

This prevents overselling while allowing temporary reservations.

---

# Reservation Lifecycle

## 1. Reserve

Customer reserves stock.

- reservedStock increases
- reservation status = PENDING

---

## 2. Confirm

Payment succeeds.

- totalStock decreases permanently
- reservedStock decreases
- reservation status = CONFIRMED

---

## 3. Release

Payment fails or user cancels.

- reservedStock decreases
- reservation status = RELEASED

---

## 4. Expiry

Reservation expires automatically.

- reservedStock decreases
- reservation status = EXPIRED

---

# Concurrency Handling

This was the core focus of the assignment.

To prevent race conditions:
- Prisma transactions are used
- stock checks occur inside transactions
- inventory updates are atomic

If two users try reserving the last unit simultaneously:
- exactly one succeeds
- the other receives HTTP 409

---

# API Endpoints

## Products

### GET /api/products

Returns:
- products
- warehouses
- available stock

---

## Warehouses

### GET /api/warehouses

Returns all warehouses.

---

## Reservations

### POST /api/reservations

Creates a reservation.

### Request

```json
{
  "productId": "string",
  "warehouseId": "string",
  "quantity": 1
}
```

### Errors
- 409 → insufficient stock

---

### POST /api/reservations/:id/confirm

Confirms reservation.

### Errors
- 410 → reservation expired

---

### POST /api/reservations/:id/release

Releases reservation early.

---

### GET /api/reservations

Returns reservation history.

Supports pagination.

Example:

```bash
/api/reservations?page=1&limit=5
```

---

# Reservation Expiry Strategy

Reservation cleanup is handled automatically using `node-cron`.

A cron job runs periodically and:
- finds expired reservations
- releases reserved inventory
- marks reservations as EXPIRED

This simulates production-style background cleanup.

---

# Database Schema

## Product
Represents inventory products.

## Warehouse
Represents storage locations.

## Inventory
Maps products to warehouses.

Contains:
- totalStock
- reservedStock

## Reservation
Tracks temporary holds.

Statuses:
- PENDING
- CONFIRMED
- RELEASED
- EXPIRED

---

# Folder Structure

```bash
app/
├── api/
│   ├── products/
│   ├── warehouses/
│   └── reservations/
│
├── components/
│   ├── ProductCard.tsx
│   ├── WarehouseCard.tsx
│   ├── ReservationPanel.tsx
│   ├── ReservationHistory.tsx
│   └── CountdownTimer.tsx
│
├── page.tsx
├── layout.tsx
│
lib/
├── prisma.ts
└── cron.ts

prisma/
├── schema.prisma
└── seed.ts
```

---

# Local Setup

## 1. Clone Repository

```bash
git clone <your-repo-url>
cd inventory-reservation-system
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Setup Environment Variables

Create `.env`

```env
DATABASE_URL="your_supabase_database_url"
```

---

# Prisma Setup

## Generate Prisma Client

```bash
npx prisma generate
```

---

## Run Migrations

```bash
npx prisma migrate dev
```

---

## Seed Database

```bash
npx prisma db seed
```

---

# Run Application

```bash
npm run dev
```

Application runs at:

```bash
http://localhost:3000
```

---

# Seed Data

The seed script inserts:
- products
- warehouses
- inventory stock

This allows the app to work immediately after setup.

---

# UI Features

## Product Listing
Displays:
- product info
- warehouse stock
- reserve button

---

## Reservation Panel
Displays:
- active reservation
- countdown timer
- confirm/release buttons

---

## Reservation History
Displays:
- previous reservations
- statuses
- timestamps

---

# Tradeoffs & Design Decisions

## Why Prisma Transactions?
Transactions ensure:
- inventory consistency
- atomic updates
- concurrency safety

---

## Why Polling Instead of WebSockets?
Polling was chosen for simplicity and reliability within assignment scope.

A production system would likely use:
- WebSockets
- Redis Pub/Sub
- event-driven updates

---

## Why Cron Cleanup?
Cron jobs provide:
- simple expiry management
- predictable cleanup
- easy deployment

Alternative approaches:
- queue workers
- lazy cleanup
- event-driven expiration

---

# Future Improvements

- WebSocket live updates
- Authentication
- Redis distributed locking
- Idempotency keys
- Advanced inventory analytics
- Admin dashboard
- Reservation retry handling
- Horizontal scaling

---

# Screenshots

## Home Page
(Add screenshot here)

## Reservation Flow
(Add screenshot here)

---

# Deployment

## Frontend
Vercel

## Database
Supabase PostgreSQL

---

# Author

Nikhil Charantimath

---

# Assignment Notes

This implementation focuses primarily on:
- correctness under concurrency
- reservation lifecycle integrity
- clean architecture
- full-stack functionality

Additional production enhancements are documented under future improvements.