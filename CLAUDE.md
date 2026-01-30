# Tiny Inventory - Project Requirements & Implementation Guide

## Project Overview

Build a full-stack inventory management system ("Tiny Inventory") that tracks stores and the products they carry. Each store can have multiple products, and each product includes basic details such as name, category, price, and quantity in stock.

## Tech Stack (Required)

- **Frontend:** ReactJS with TypeScript (Vite)
- **Backend:** NestJS with TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
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
- **DTO Pattern** - Separate DTOs for create/update/query with class-validator
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

## Security Concerns (NOT PRODUCTION READY)

### Current State - INSECURE

```typescript
// main.ts - ALLOWS ALL ORIGINS
app.enableCors({
  origin: true,      // Accepts ANY origin
  credentials: true,
});
```

### Missing Security Measures

| Security Measure | Status | Priority |
|------------------|--------|----------|
| CORS whitelist | ❌ Not implemented | HIGH |
| Authentication (JWT/Session) | ❌ Not implemented | HIGH |
| Authorization (RBAC) | ❌ Not implemented | HIGH |
| Rate limiting | ❌ Not implemented | MEDIUM |
| CSRF tokens | ❌ Not implemented | MEDIUM |
| Security headers (Helmet) | ❌ Not implemented | MEDIUM |
| Input sanitization | ⚠️ Basic (class-validator only) | LOW |

### Required for Production

```typescript
// Proper CORS config
app.enableCors({
  origin: ['https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
});

// Add @nestjs/throttler for rate limiting
// Add @nestjs/passport + passport-jwt for auth
// Add helmet for security headers
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
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  storeId     String
  store       Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
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
| PATCH | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

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
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
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
│   │   ├── products/
│   │   │   ├── products.module.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── products.service.spec.ts
│   │   │   └── dto/
│   │   ├── analytics/
│   │   │   ├── analytics.module.ts
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── analytics.service.spec.ts
│   │   │   └── dto/
│   │   └── health/
│   │       ├── health.module.ts
│   │       └── health.controller.ts
│   └── test/
│       └── setup.ts
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
        │       └── ProductFilters.tsx
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

### Backend (class-validator)
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
