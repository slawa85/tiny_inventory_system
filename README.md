# Tiny Inventory

A full-stack inventory management system for tracking stores and their products.

## Quick Start

```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker compose up --build

# Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:3000/api
```

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + TanStack Query
- **Backend:** NestJS + TypeScript + Prisma + PostgreSQL
- **Validation:** Zod (backend & shared schemas)
- **Logging:** Pino (structured JSON logging)
- **Testing:** Vitest

## API Sketch

```
GET    /api/stores              # List all stores
GET    /api/stores/:id          # Get store details
POST   /api/stores              # Create store
PATCH  /api/stores/:id          # Update store
DELETE /api/stores/:id          # Delete store

GET    /api/products            # List products (filters: storeId, category, minPrice, maxPrice, inStock, lowStock, search, page, limit, sortBy, sortOrder)
GET    /api/products/:id        # Get product details
POST   /api/products            # Create product
PATCH  /api/products/:id        # Update product (requires version for optimistic locking)
DELETE /api/products/:id        # Delete product

POST   /api/products/:id/adjust-quantity  # Atomic quantity adjustment (delta operation)

GET    /api/analytics/inventory-value     # Total inventory value by store
GET    /api/analytics/low-stock           # Products below minStock threshold
GET    /api/analytics/category-summary    # Product count and value by category

GET    /api/health              # Health check
```

## Beyond Basic CRUD

Operations that go beyond simple create/read/update/delete:

### Analytics Aggregations
| Endpoint | Operation |
|----------|-----------|
| `/api/analytics/inventory-value` | Calculates total inventory value (price × quantity) grouped by store |
| `/api/analytics/low-stock` | Finds products where `quantity <= minStock` threshold |
| `/api/analytics/category-summary` | Aggregates product count and total value by category |

### Atomic Quantity Adjustment
```bash
POST /api/products/:id/adjust-quantity
{ "adjustment": -5, "reason": "sale" }
```
Uses Prisma's `increment`/`decrement` for atomic updates—avoids race conditions that would occur with read-modify-write patterns.

### Optimistic Locking
```bash
PATCH /api/products/:id
{ "name": "New Name", "version": 3 }
```
Checks version field before update; returns **409 Conflict** if another user modified the record since it was fetched.

### Complex Product Queries
The product list endpoint supports server-side:
- **Multi-field filtering**: store, category, price range, stock status (inStock/lowStock)
- **Full-text search**: across name, description, and SKU fields
- **Pagination**: with metadata (total, totalPages, hasNextPage, hasPreviousPage)
- **Sorting**: by name, price, quantity, or createdAt (asc/desc)

## Development

```bash
# Backend development
cd server && npm install && npm run start:dev

# Frontend development
cd web && npm install && npm run dev

# Run backend tests
cd server && npm test

# Apply database migrations
cd server && npx prisma migrate dev
```

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@localhost:5432/inventory

# Optional
NODE_ENV=development          # development | production | test
PORT=3000                     # API port (default: 3000)
CORS_ALLOWED_ORIGINS=...      # Comma-separated origins (required in production)
```

## Security Features

| Feature | Implementation | Status |
|---------|---------------|--------|
| CORS | Whitelist-based origin validation | Implemented |
| Security Headers | Helmet middleware (CSP, X-Frame-Options, HSTS, etc.) | Implemented |
| Rate Limiting | @nestjs/throttler (300/min default, stricter on destructive ops) | Implemented |
| Input Validation | Zod schemas with ZodValidationPipe | Implemented |
| Environment Validation | Joi schema, fails fast on misconfiguration | Implemented |
| Authentication | JWT-based auth | Not implemented |
| Authorization | Role-based access control | Not implemented |

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

## Decisions & Trade-offs

1. **Zod over class-validator**: Cleaner validation syntax, automatic type inference, composable schemas. Trade-off: requires nestjs-zod adapter.

2. **Pino for logging**: Fast structured JSON logging, automatic request logging via nestjs-pino. Trade-off: less readable in development (mitigated with pino-pretty).

3. **Optimistic Locking + Delta Operations**: Hybrid approach balances data integrity with usability. Trade-off: more complex than simple overwrites, but prevents lost updates.

4. **Prisma over TypeORM**: Superior TypeScript integration and schema-first approach. Trade-off: slightly less flexible for complex raw SQL queries.

5. **Dumb/Thin Frontend**: All filtering, sorting, and pagination handled by backend. Trade-off: more API calls, but simpler frontend code and consistent behavior.

6. **One-to-Many Relationship**: Each product belongs to exactly one store. Trade-off: simpler model but a product can't be shared across stores.

7. **TanStack Query for State**: Purpose-built for server state management with automatic caching and refetching. Trade-off: adds a dependency but eliminates significant boilerplate.

## Testing Approach

- **Unit Tests**: Vitest for backend service layer tests with mocked Prisma client
- **Focus Areas**: ProductsService (filtering, pagination, CRUD), StoresService (CRUD), AnalyticsService (aggregations)
- **Why Service Layer**: Business logic lives in services; controllers are thin and don't need extensive testing

```bash
cd server && npm test
```

## If I Had More Time

1. **Authentication & Multi-tenancy**: JWT-based auth with organization-level data isolation (row-level security)

2. **Audit Log**: Track all inventory changes (who, what, when) for accountability

3. **E2E Tests**: Playwright tests for critical user flows

4. **Real-time Updates**: WebSocket support for live inventory updates across users

5. **Export to CSV/Excel**: Reporting needs

6. **Bulk quantity adjustments**: Import CSV, update many at once
