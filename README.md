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

## API Sketch

```
GET    /api/stores              # List all stores
GET    /api/stores/:id          # Get store details
POST   /api/stores              # Create store
PATCH  /api/stores/:id          # Update store
DELETE /api/stores/:id          # Delete store

GET    /api/products            # List products (with filters: storeId, category, minPrice, maxPrice, inStock, lowStock, search, page, limit, sortBy, sortOrder)
GET    /api/products/:id        # Get product details
POST   /api/products            # Create product
PATCH  /api/products/:id        # Update product
DELETE /api/products/:id        # Delete product

GET    /api/analytics/inventory-value   # Total inventory value by store
GET    /api/analytics/low-stock         # Products below minStock threshold
GET    /api/analytics/category-summary  # Product count and value by category
```

## Development

```bash
# Backend development
cd server && npm install && npm run start:dev

# Frontend development
cd web && npm install && npm run dev

# Run backend tests
cd server && npm test
```

## Decisions & Trade-offs

1. **Prisma over TypeORM**: Chose Prisma for its superior TypeScript integration and schema-first approach. Trade-off: slightly less flexible for complex raw SQL queries.

2. **Dumb/Thin Frontend**: All filtering, sorting, and pagination is handled by the backend. The frontend only renders UI and passes user selections to API endpoints. Trade-off: more API calls, but simpler frontend code and consistent behavior.

3. **One-to-Many Relationship**: Each product belongs to exactly one store (vs. many-to-many). Trade-off: simpler model but a product can't be shared across stores.

4. **TanStack Query for State**: Purpose-built for server state management with automatic caching and refetching. Trade-off: adds a dependency but eliminates significant boilerplate.

5. **Cascade Delete**: Deleting a store removes all its products. Trade-off: simpler data integrity but destructive operation requires confirmation.

## Testing Approach

- **Unit Tests**: Vitest for backend service layer tests with mocked Prisma client
- **Focus Areas**: ProductsService (filtering, pagination, CRUD), StoresService (CRUD), AnalyticsService (aggregations)
- **Why Service Layer**: Business logic lives in services; controllers are thin and don't need extensive testing

Run tests:
```bash
cd server && npm test
```

## If I Had More Time

1. **E2E Tests**: Add Playwright or Cypress tests for critical user flows (create product, filter products, view analytics)

2. **Authentication**: Implement JWT-based auth with role-based access control (admin vs. viewer roles)

3. **Real-time Updates**: Add WebSocket support for live inventory updates when products are modified by other users
