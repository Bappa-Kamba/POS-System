# POS System Development Rules for Cursor AI

## Project Overview
You are building a multi-branch Point of Sale (POS) system with offline-first architecture. This is a local-first application with future cloud sync capabilities.

## Core Principles
1. **Performance First**: Every feature must be optimized for speed
2. **Offline-First**: No internet dependency for core operations
3. **Type Safety**: Use TypeScript strictly, no `any` types
4. **Clean Code**: Follow DRY principles, write self-documenting code
5. **Security**: Never expose sensitive data, always validate inputs
6. **Audit Everything**: Log all critical actions for compliance

## Technology Stack

### Backend
- **Framework**: NestJS 10+ with TypeScript strict mode
- **ORM**: Prisma 5+ with SQLite (migrate to PostgreSQL later)
- **Auth**: JWT with bcrypt (10 rounds)
- **Validation**: class-validator + class-transformer
- **Logging**: Winston with daily rotation
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18+ (functional components only, no class components)
- **Build Tool**: Vite 5+
- **Styling**: TailwindCSS 3+ (use utility classes, no custom CSS unless necessary)
- **State**: Zustand (global) + React Query (server state)
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6
- **Charts**: Recharts (lightweight)
- **Icons**: Lucide React

## File Naming Conventions

### Backend
- Controllers: `*.controller.ts` (e.g., `products.controller.ts`)
- Services: `*.service.ts` (e.g., `products.service.ts`)
- DTOs: `*.dto.ts` (e.g., `create-product.dto.ts`)
- Entities: `*.entity.ts` or use Prisma models
- Guards: `*.guard.ts` (e.g., `roles.guard.ts`)
- Interceptors: `*.interceptor.ts`
- Modules: `*.module.ts`

### Frontend
- Components: PascalCase (e.g., `ProductCard.jsx`)
- Pages: PascalCase (e.g., `Dashboard.jsx`)
- Hooks: camelCase with `use` prefix (e.g., `useProducts.js`)
- Services: camelCase with `.service.js` suffix
- Stores: camelCase with `Store` suffix (e.g., `authStore.js`)
- Utils: camelCase (e.g., `formatters.js`)

## Code Style Rules

### Backend TypeScript
```typescript
// ✅ GOOD: Always use interfaces for DTOs
export interface CreateProductDto {
  name: string;
  sku: string;
  price: number;
}

// ✅ GOOD: Use class-validator decorators
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;
}

// ✅ GOOD: Always handle errors
async findOne(id: string) {
  const product = await this.prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new NotFoundException('Product not found');
  }
  return product;
}

// ❌ BAD: Don't use any
async getData(): any {
  return this.prisma.product.findMany();
}

// ❌ BAD: Don't expose errors
catch (error) {
  throw error; // Exposes internal details
}
```

### Frontend React
```jsx
// ✅ GOOD: Functional components with hooks
export const ProductCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  
  return (
    <div className="bg-white rounded-lg p-4">
      {/* Component JSX */}
    </div>
  );
};

// ✅ GOOD: Use custom hooks
const { data: products, isLoading } = useProducts();

// ✅ GOOD: Memoize expensive calculations
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}, [items]);

// ❌ BAD: Don't use class components
class ProductCard extends React.Component {
  // Don't do this
}

// ❌ BAD: Don't mutate state directly
const addItem = () => {
  items.push(newItem); // Wrong
  setItems(items); // Wrong
};

// ✅ GOOD: Immutable updates
const addItem = () => {
  setItems([...items, newItem]);
};
```

## Database Rules

### Prisma Schema
```prisma
// ✅ GOOD: Always add indexes
model Product {
  id   String @id @default(uuid())
  sku  String @unique
  name String
  
  @@index([sku])
  @@index([name])
  @@map("products")
}

// ✅ GOOD: Use proper relations
model Sale {
  id     String     @id @default(uuid())
  items  SaleItem[]
  
  @@map("sales")
}

// ✅ GOOD: Use enums for fixed values
enum ProductCategory {
  FROZEN
  DRINKS
  ACCESSORIES
  OTHER
}
```

### Queries
```typescript
// ✅ GOOD: Select only needed fields
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
  },
});

// ✅ GOOD: Use pagination
const products = await prisma.product.findMany({
  skip: (page - 1) * limit,
  take: limit,
});

// ❌ BAD: Don't fetch everything
const products = await prisma.product.findMany(); // Returns all fields and records

// ✅ GOOD: Use transactions for multi-step operations
await prisma.$transaction(async (tx) => {
  await tx.product.update({ ... });
  await tx.inventoryLog.create({ ... });
});
```

## Design System - TailwindCSS Classes

### Use These Exact Patterns

**Buttons:**
```jsx
// Primary
<button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">

// Secondary
<button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg font-medium transition-colors">

// Danger
<button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
```

**Input Fields:**
```jsx
<input className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100" />
```

**Cards:**
```jsx
<div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 p-6">
```

**Modal Overlay:**
```jsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40">
```

## API Response Format

### Always Use This Structure
```typescript
// Success
{
  "success": true,
  "data": any,
  "message": string (optional),
  "meta": { page, limit, total } (for pagination)
}

// Error
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details": any (optional)
  },
  "statusCode": number
}
```

## Security Rules

### Authentication
- ✅ Always hash passwords with bcrypt (10 rounds)
- ✅ Use JWT with 24-hour expiration
- ✅ Implement refresh tokens (7 days)
- ✅ Never log sensitive data (passwords, tokens)
- ❌ Never store tokens in localStorage (use Zustand or httpOnly cookies)

### Authorization
- ✅ Use guards for all protected routes
- ✅ Check user role before operations
- ✅ Validate user owns the resource
- ❌ Never trust client-side role checks alone

### Input Validation
- ✅ Validate ALL inputs with DTOs (backend)
- ✅ Validate ALL forms with Zod (frontend)
- ✅ Sanitize user inputs
- ✅ Use parameterized queries (Prisma does this)
- ❌ Never trust user input

## Audit Logging

### Log These Actions
```typescript
// Always create audit logs for:
- User login/logout
- Product create/update/delete
- Sale creation
- Inventory adjustments
- User management
- Backup/restore
- Settings changes

// Audit log structure
await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: 'UPDATE',
    entity: 'Product',
    entityId: product.id,
    oldValues: JSON.stringify(oldData),
    newValues: JSON.stringify(newData),
  },
});
```

## Error Handling

### Backend
```typescript
// ✅ GOOD: Specific exceptions
throw new NotFoundException('Product not found');
throw new ConflictException('SKU already exists');
throw new BadRequestException('Invalid quantity');

// ✅ GOOD: Try-catch with logging
try {
  await this.processPayment(data);
} catch (error) {
  this.logger.error(`Payment failed: ${error.message}`, error.stack);
  throw new InternalServerErrorException('Payment processing failed');
}
```

### Frontend
```jsx
// ✅ GOOD: Handle all states
const { data, isLoading, error } = useQuery('products', fetchProducts);

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
return <ProductList products={data} />;

// ✅ GOOD: User-friendly messages
catch (error) {
  toast.error('Failed to save product. Please try again.');
  console.error(error);
}
```

## Performance Rules

### Backend
- ✅ Use indexes on frequently queried fields
- ✅ Paginate all list endpoints
- ✅ Use `select` to fetch only needed fields
- ✅ Use `include` judiciously
- ✅ Implement caching for expensive operations
- ❌ Never do N+1 queries

### Frontend
- ✅ Lazy load routes with React.lazy()
- ✅ Memoize expensive calculations with useMemo()
- ✅ Debounce search inputs (300ms)
- ✅ Use React.memo for pure components
- ✅ Virtual scroll for long lists (react-window)
- ❌ Don't fetch data on every render

## Testing Requirements

### Backend Tests
```typescript
// Unit test structure
describe('ProductsService', () => {
  describe('create', () => {
    it('should create a product successfully', async () => {
      // Arrange
      const dto = { name: 'Test', sku: 'TEST-001' };
      
      // Act
      const result = await service.create(dto);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe('Test');
    });
  });
});
```

### Frontend Tests
```jsx
// Component test structure
describe('ProductCard', () => {
  it('should render product information', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Product Name')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });
});
```

## Common Patterns

### CRUD Operations (Backend)
```typescript
@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    return this.prisma.product.create({ data });
  }

  async findAll(params: FindAllParams) {
    const { skip = 0, take = 20, search } = params;
    const where = search ? { name: { contains: search } } : {};
    
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({ where, skip, take }),
      this.prisma.product.count({ where }),
    ]);
    
    return { data, meta: { total, page: skip / take + 1 } };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException();
    return product;
  }

  async update(id: string, data: UpdateProductDto) {
    await this.findOne(id); // Verify exists
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({ 
      where: { id }, 
      data: { isActive: false } // Soft delete
    });
  }
}
```

### Data Fetching (Frontend)
```jsx
// Custom hook with React Query
export const useProducts = (filters) => {
  return useQuery(
    ['products', filters],
    () => productService.getAll(filters),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      keepPreviousData: true,
    }
  );
};

// Mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (data) => productService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Product created successfully');
      },
      onError: (error) => {
        toast.error('Failed to create product');
      },
    }
  );
};
```

## Critical Business Rules

### Stock Management
```typescript
// Always use transactions for stock changes
await prisma.$transaction(async (tx) => {
  // 1. Check stock availability
  const product = await tx.product.findUnique({ where: { id } });
  if (product.quantityInStock < quantity) {
    throw new Error('Insufficient stock');
  }
  
  // 2. Deduct stock
  await tx.product.update({
    where: { id },
    data: { quantityInStock: { decrement: quantity } },
  });
  
  // 3. Create inventory log
  await tx.inventoryLog.create({
    data: {
      productId: id,
      changeType: 'SALE',
      quantityChange: -quantity,
      previousQuantity: product.quantityInStock,
      newQuantity: product.quantityInStock - quantity,
    },
  });
});
```

### Sales Calculation
```typescript
// Item calculations
const itemSubtotal = quantity * unitPrice;
const itemTaxAmount = taxable ? itemSubtotal * taxRate : 0;
const itemTotal = itemSubtotal + itemTaxAmount;

// Sale totals
const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0);
const total = subtotal + taxAmount;

// Profit calculation
const profit = items.reduce((sum, item) => {
  return sum + ((item.unitPrice - item.costPrice) * item.quantity);
}, 0);
```

### Receipt Number Generation
```typescript
// Format: RCP-YYYYMMDD-XXXX
const generateReceiptNumber = async (date: Date) => {
  const dateStr = format(date, 'yyyyMMdd');
  
  // Get count of receipts today
  const count = await prisma.sale.count({
    where: {
      createdAt: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
    },
  });
  
  const sequence = String(count + 1).padStart(4, '0');
  return `RCP-${dateStr}-${sequence}`;
};
```

## What NOT to Do

❌ **Never:**
1. Use `any` type in TypeScript
2. Store passwords in plain text
3. Expose internal error details to users
4. Skip input validation
5. Mutate state directly in React
6. Use inline styles (use TailwindCSS)
7. Create class components (use functional)
8. Use var (use const/let)
9. Skip error handling
10. Commit .env files
11. Use console.log in production (use logger)
12. Skip testing critical paths
13. Use localStorage for sensitive data
14. Trust client-side data without validation
15. Skip database transactions for multi-step operations

## Documentation Standards

### Code Comments
```typescript
// ✅ GOOD: Explain WHY, not WHAT
// Calculate profit margin accounting for bulk discounts
const margin = calculateProfitMargin(price, cost, quantity);

// ❌ BAD: States the obvious
// Set the price
const price = 100;

// ✅ GOOD: Document complex business logic
/**
 * Calculates final price with tiered discounts:
 * - 5% off for orders > 50 units
 * - 10% off for orders > 100 units
 * - 15% off for orders > 200 units
 */
```

### Function Documentation
```typescript
/**
 * Adjusts product inventory and creates audit log
 * 
 * @param productId - UUID of the product
 * @param quantityChange - Positive for restock, negative for reduction
 * @param changeType - Type of inventory change (RESTOCK, SALE, etc.)
 * @param reason - Optional reason for the change
 * @returns Updated product with new quantity
 * @throws {NotFoundException} If product doesn't exist
 * @throws {Error} If resulting quantity would be negative
 */
async adjustStock(
  productId: string,
  quantityChange: number,
  changeType: InventoryChangeType,
  reason?: string,
): Promise<Product> {
  // Implementation
}
```

## Git Commit Messages

Follow conventional commits:
```bash
feat(products): add barcode generation
fix(sales): correct tax calculation for weighted items
docs(api): update authentication endpoint documentation
refactor(auth): simplify JWT verification logic
test(products): add unit tests for stock adjustment
chore(deps): update prisma to v5.8.0
```

## Environment Setup Reminders

### Backend .env
```env
DATABASE_URL="file:./pos.db"
JWT_SECRET="minimum-32-characters-secret-key"
JWT_EXPIRATION="24h"
BCRYPT_ROUNDS="10"
LOG_LEVEL="info"
```

### Frontend .env
```env
VITE_API_URL="http://localhost:3000/api/v1"
VITE_APP_NAME="POS System"
```

## When Generating Code

1. **Start with tests** (TDD approach)
2. **Generate types first** (interfaces, DTOs)
3. **Create database schema** before services
4. **Build services** before controllers
5. **Create components** before pages
6. **Add error handling** immediately
7. **Write documentation** as you code
8. **Test manually** after each feature

## Priority Order for Building

1. Database schema + migrations
2. Authentication system
3. User management
4. Product management (without variants)
5. Product variants
6. POS interface
7. Sales processing
8. Reports
9. Inventory management
10. Expense tracking
11. Audit logs
12. Backup/restore
13. Settings

## Remember

- **Performance is critical** - this runs locally, must be fast
- **Offline-first** - assume no internet connection
- **Data integrity** - use transactions, validate everything
- **User experience** - loading states, error messages, confirmations
- **Security** - validate, audit, never trust input
- **Maintainability** - clean code, proper naming, documentation

---

**Use this file as your source of truth for all code generation decisions.**
