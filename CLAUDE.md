# Tiny Inventory - Project Requirements & Implementation Guide

## Project Overview

Build a full-stack inventory management system ("Tiny Inventory") that tracks stores and the products they carry. Each store can have multiple products, and each product includes basic details such as name, category, price, and quantity in stock.

## Tech Stack (Required)

- **Frontend:** ReactJS with TypeScript (Vite)
- **Backend:** NestJS with TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod (nestjs-zod) + Joi (env validation)
- **Logging:** Pino (nestjs-pino)
- **Testing:** Vitest (backend unit tests)
- **Infrastructure:** Docker Compose (single command startup)
- **Styling:** Tailwind CSS
- **State Management:** TanStack Query (React Query)

## Architecture Decisions

### Frontend: Dumb/Thin Client
- **All filtering, sorting, and pagination is done on the backend**
- Frontend only: renders UI, captures user input, calls API endpoints, displays results
- No client-side business logic
- Separate backend endpoints for each operation

### Data Model: One-to-Many
- Each Product belongs to exactly one Store
- Store has many Products
- Cascade delete (deleting store removes its products)

### ORM: Prisma
- Superior TypeScript integration
- Schema-first approach
- Built-in pagination support

### Backend: Layered Architecture (N-Tier)

```
┌─────────────────────────────────────┐
│         Controllers (HTTP)          │  ← Presentation Layer
├─────────────────────────────────────┤
│           Services                  │  ← Business Logic Layer
├─────────────────────────────────────┤
│         Prisma (ORM)                │  ← Data Access Layer
└─────────────────────────────────────┘
```

**Patterns Used:**
- **Modular Architecture** - Each feature in its own NestJS module
- **Dependency Injection** - NestJS DI container throughout
- **Service Layer** - Thin controllers, all logic in services
- **DTO Pattern** - Separate DTOs for create/update/query with zod
- **Global Exception Filter** - Centralized error handling

**Patterns NOT Used (and why):**
- **Clean Architecture / Hexagonal** - Overkill for simple CRUD app
- **CQRS** - Single service handles both reads and writes
- **Repository Pattern** - Prisma injected directly (no abstraction needed for this scale)

### Build Notes
- NestJS outputs compiled files to `dist/src/` (not `dist/`)
- Seed script located at `src/seed.ts` and compiled by nest build to `dist/src/seed.js`
- Main entry point: `dist/src/main.js`

---

## Security Status

### Implemented Security Measures

| Security Measure | Implementation |
|------------------|----------------|
| CORS whitelist | Configurable via `CORS_ALLOWED_ORIGINS` env var; defaults to localhost in dev |
| Rate limiting | `@nestjs/throttler` - 300 requests/minute per IP |
| Security headers | `helmet` middleware enabled |
| Input validation | `zod` schemas via `nestjs-zod` |

```typescript
// main.ts - Current CORS config
app.use(helmet());
app.enableCors(getCorsConfig(config, logger)); // Whitelist-based

// app.module.ts - Rate limiting
ThrottlerModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    throttlers: [{ name: 'default', ttl: 60000, limit: 300 }],
  }),
});
```

### Still Missing (NOT PRODUCTION READY)

| Security Measure | Status | Priority |
|------------------|--------|----------|
| Authentication (JWT/Session) | ❌ Not implemented | HIGH |
| Authorization (RBAC) | ❌ Not implemented | HIGH |
| CSRF tokens | ❌ Not implemented | MEDIUM |

### Required for Production

```typescript
// Add @nestjs/passport + passport-jwt for auth
// Add CSRF protection for state-changing operations
```

---

## Concurrency Handling

The application uses a **hybrid approach** to handle concurrent updates:

### Optimistic Locking (for metadata)
Product updates require a `version` field. If another user modified the product, the update is rejected with a 409 Conflict.

```bash
PATCH /api/products/:id
{ "name": "New Name", "price": 29.99, "version": 3 }

# If version mismatch → 409 Conflict
```

### Delta Operations (for quantity)
Quantity changes use atomic increments/decrements, avoiding conflicts entirely.

```bash
POST /api/products/:id/adjust-quantity
{ "adjustment": -5, "reason": "sale" }

# Multiple concurrent adjustments all succeed
```

---

## Database Schema

```prisma
model Store {
  id        String    @id @default(uuid())
  name      String
  address   String
  city      String
  state     String
  zipCode   String
  phone     String?
  email     String?
  isActive  Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  products  Product[]
}

model Product {
  id          String   @id @default(uuid())
  name        String
  description String?
  sku         String   @unique
  category    String
  price       Decimal  @db.Decimal(10, 2)
  quantity    Int      @default(0)
  minStock    Int      @default(10)
  isActive    Boolean  @default(true)
  version     Int      @default(0)  // Optimistic locking
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  storeId     String
  store       Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)

  // Single-column indexes
  @@index([category])
  @@index([price])
  @@index([quantity])
  @@index([createdAt])

  // Composite indexes for common query patterns
  @@index([storeId, category])
  @@index([storeId, createdAt(sort: Desc)])
  @@index([storeId, price])
}
```

---

## API Endpoints

### Stores
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stores` | List all stores |
| GET | `/api/stores/:id` | Get store details |
| POST | `/api/stores` | Create store |
| PATCH | `/api/stores/:id` | Update store |
| DELETE | `/api/stores/:id` | Delete store |

### Products (with filtering & pagination - ALL on backend)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products with filters/pagination |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/products` | Create product |
| PATCH | `/api/products/:id` | Update product (requires version for optimistic locking) |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/products/:id/adjust-quantity` | Atomic quantity adjustment (delta operation) |

**Query Parameters for Products:**
```
storeId=uuid           - Filter by store
category=string        - Filter by category
minPrice=number        - Minimum price filter
maxPrice=number        - Maximum price filter
inStock=boolean        - Only products with quantity > 0
lowStock=boolean       - Products where quantity <= minStock
search=string          - Search in name/description/sku
page=number            - Page number (1-based)
limit=number           - Items per page (default 20, max 100)
sortBy=string          - Sort field (name, price, quantity, createdAt)
sortOrder=asc|desc     - Sort direction
```

### Analytics (Non-trivial Operations)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/inventory-value` | Total inventory value by store |
| GET | `/api/analytics/low-stock` | Products below minStock threshold |
| GET | `/api/analytics/category-summary` | Product count and value by category |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check endpoint |

---

## Response Formats

### Paginated Response
```typescript
{
  data: T[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
}
```

### Error Response
```typescript
{
  statusCode: number,
  message: string | string[],
  error: string,
  timestamp: string,
  path: string
}
```

---

## Project Structure

```
/
├── docker-compose.yml
├── .env.example
├── README.md
├── CLAUDE.md
├── server/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── seed.ts
│   │   ├── config/
│   │   │   └── env.validation.ts
│   │   ├── common/
│   │   │   ├── dto/
│   │   │   │   ├── pagination-query.dto.ts
│   │   │   │   └── paginated-response.dto.ts
│   │   │   └── filters/
│   │   │       └── http-exception.filter.ts
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── stores/
│   │   │   ├── stores.module.ts
│   │   │   ├── stores.controller.ts
│   │   │   ├── stores.service.ts
│   │   │   ├── stores.service.spec.ts
│   │   │   └── dto/
│   │   │       ├── create-store.dto.ts
│   │   │       └── update-store.dto.ts
│   │   ├── products/
│   │   │   ├── products.module.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── products.service.spec.ts
│   │   │   └── dto/
│   │   │       ├── create-product.dto.ts
│   │   │       ├── update-product.dto.ts
│   │   │       ├── product-query.dto.ts
│   │   │       └── adjust-quantity.dto.ts
│   │   ├── analytics/
│   │   │   ├── analytics.module.ts
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── analytics.service.spec.ts
│   │   │   └── dto/
│   │   │       ├── inventory-value.dto.ts
│   │   │       └── category-summary.dto.ts
│   │   └── health/
│   │       ├── health.module.ts
│   │       └── health.controller.ts
└── web/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── api/
        │   ├── client.ts
        │   ├── stores.api.ts
        │   ├── products.api.ts
        │   └── analytics.api.ts
        ├── components/
        │   ├── ui/
        │   │   ├── Button.tsx
        │   │   ├── Input.tsx
        │   │   ├── Select.tsx
        │   │   ├── Card.tsx
        │   │   ├── Table.tsx
        │   │   ├── Pagination.tsx
        │   │   ├── Spinner.tsx
        │   │   ├── ErrorMessage.tsx
        │   │   └── EmptyState.tsx
        │   ├── layout/
        │   │   ├── Header.tsx
        │   │   └── Layout.tsx
        │   ├── stores/
        │   │   ├── StoreList.tsx
        │   │   ├── StoreCard.tsx
        │   │   └── StoreForm.tsx
        │   └── products/
        │       ├── ProductList.tsx
        │       ├── ProductTable.tsx
        │       ├── ProductForm.tsx
        │       ├── ProductFilters.tsx
        │       └── QuantityAdjustment.tsx
        ├── hooks/
        │   ├── useStores.ts
        │   ├── useProducts.ts
        │   └── useAnalytics.ts
        ├── pages/
        │   ├── StoresPage.tsx
        │   ├── StoreDetailPage.tsx
        │   ├── ProductsPage.tsx
        │   └── ProductEditPage.tsx
        ├── types/
        │   ├── store.types.ts
        │   ├── product.types.ts
        │   └── api.types.ts
        └── utils/
            └── formatters.ts
```

---

## Frontend Screens

1. **Stores List** (`/`) - View all stores with summary stats
2. **Store Detail** (`/stores/:id`) - Store info + products table with filters
3. **Products** (`/products`) - All products with filtering/pagination
4. **Product Edit** (`/products/:id/edit`) - Edit form with validation
5. **Product Create** (`/products/new`) - Create form with validation

### UI States (Required)
- **Loading:** Skeleton/spinner while fetching data
- **Error:** Error message with retry button
- **Empty:** Helpful message when no data

---

## Seed Data Requirements

Database must be seeded on startup with:
- 3 stores (different locations)
- 15-20 products per store across categories:
  - Electronics
  - Clothing
  - Home & Garden
  - Sports
  - Books

Seed script runs automatically on `docker compose up --build`.

---

## Testing Requirements

- Vitest for backend unit tests
- Focus on service layer tests
- Mock Prisma client
- Test:
  - ProductsService (filtering, pagination, CRUD)
  - StoresService (CRUD operations)
  - AnalyticsService (aggregations)

Run tests: `cd server && npm test`

---

## Docker Configuration

Single command startup: `docker compose up --build`

Services:
- `postgres` - PostgreSQL 16 database
- `server` - NestJS backend (port 3000)
- `web` - React frontend with nginx (port 8080)

Health checks on all services.

---

## README Requirements

Must include:
1. Run instructions
2. API sketch (5-10 lines)
3. Decisions & Trade-offs section
4. Testing Approach section
5. "If I had more time" (3 bullets)

---

## Validation Requirements

### Backend (zod)
- Required fields validation
- Type validation (numbers, strings)
- Range validation (price > 0, quantity >= 0)
- Clear error messages

### Frontend
- Required field indicators
- Client-side validation before submit
- Display server validation errors

---

## Commands Reference

```bash
# Start everything
docker compose up --build

# Development (local)
cd server && npm run start:dev
cd web && npm run dev

# Run tests
cd server && npm test

# Generate Prisma client
cd server && npx prisma generate

# Run migrations
cd server && npx prisma migrate dev

# Seed database
cd server && npx prisma db seed
```
