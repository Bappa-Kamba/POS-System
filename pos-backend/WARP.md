# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a NestJS-based Point of Sale (POS) system backend with the following key components:

- **Framework**: NestJS with TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT-based with bcrypt for password hashing
- **Package Manager**: pnpm
- **API Documentation**: Swagger/OpenAPI

## Development Commands

### Setup and Installation
```bash
pnpm install                    # Install dependencies
```

### Database Operations
```bash
npx prisma generate            # Generate Prisma client after schema changes
npx prisma db push            # Push schema changes to database
npx prisma db seed            # Seed database with sample data
npx prisma studio             # Open Prisma Studio for database management
```

### Development Server
```bash
pnpm run start:dev            # Start development server with hot reload
pnpm run start:debug          # Start with debug mode enabled
pnpm run start                # Start without hot reload
pnpm run start:prod           # Start production build
```

### Build and Production
```bash
pnpm run build               # Build the application
```

### Testing
```bash
pnpm run test                # Run unit tests
pnpm run test:watch          # Run tests in watch mode
pnpm run test:cov            # Run tests with coverage report
pnpm run test:debug          # Run tests in debug mode
pnpm run test:e2e            # Run end-to-end tests
```

### Code Quality
```bash
pnpm run lint                # Run ESLint and auto-fix issues
pnpm run format              # Format code with Prettier
```

## Database Architecture

### Core Entities
- **User Management**: Users with roles (ADMIN, CASHIER) linked to branches
- **Branch Management**: Multi-branch support with business information
- **Product & Inventory**: Products with optional variants, inventory tracking, and stock management
- **Sales & Transactions**: Complete POS functionality with receipts, payments, and audit trails
- **Expenses**: Business expense tracking
- **Audit & Security**: Comprehensive audit logging and system settings

### Key Relationships
- Branch → Users, Products, Sales, Expenses (one-to-many)
- Product → ProductVariants (one-to-many, optional)
- Sale → SaleItems, Payments (one-to-many)
- Inventory tracking through InventoryLog for all stock changes

### Database Schema Highlights
- Uses UUID primary keys across all entities
- Comprehensive indexing for performance
- Audit trail for all critical operations
- Support for both simple products and products with variants
- Multi-payment method support (CASH, CARD, TRANSFER)

## Project Structure

The application follows standard NestJS patterns:
- `src/` - Main application source code
- `prisma/` - Database schema and migrations
- `test/` - End-to-end tests
- Main entry point: `src/main.ts`
- Core module: `src/app.module.ts`

## Configuration

### Environment Variables (.env)
- Database configuration via `DATABASE_URL`
- JWT secrets and expiration settings
- Server configuration (port, API prefix, CORS)
- Backup and logging settings

### TypeScript Configuration
- Strict type checking enabled
- Decorator metadata enabled for NestJS
- Modern ES2023 target with CommonJS modules

## Development Notes

### Database Seeding
The seed file (`prisma/seed.ts`) creates:
- Main branch with Nigerian business settings
- Admin user (username: admin, password: admin123)
- Cashier user (username: cashier, password: cashier123)
- Sample products including variants
- Sample expense record

### Authentication System
- JWT-based authentication with refresh tokens
- Bcrypt password hashing (configurable rounds)
- Role-based access control (ADMIN, CASHIER)

### Testing Strategy
- Unit tests with Jest (located in `src/` as `.spec.ts` files)
- E2E tests in `test/` directory
- Test configuration supports both unit and integration testing

## Code Quality Tools
- **ESLint**: TypeScript-aware linting with Prettier integration
- **Prettier**: Code formatting with single quotes and trailing commas
- **TypeScript**: Strict mode enabled for type safety

## API Features
- Swagger/OpenAPI documentation integration
- Winston logging with daily rotation
- CORS configuration for frontend integration
- Express-based with NestJS abstractions