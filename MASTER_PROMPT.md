export default api;
```

### 8.2 Role-Based Access Control

#### Backend Guards

```typescript
// common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}

// Decorator
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

// Usage in controller
@Get('users')
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
async getUsers() {
  // Only admins can access
}
```

#### Frontend Route Protection

```jsx
// components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// components/RequireRole.jsx
export const RequireRole = ({ role, children }) => {
  const { user } = useAuthStore();
  
  if (user?.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};
```

### 8.3 Audit Logging Implementation

#### Backend Audit Interceptor

```typescript
// common/interceptors/audit.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, url, body } = request;

    // Determine action type from HTTP method
    const actionMap = {
      POST: AuditAction.CREATE,
      PUT: AuditAction.UPDATE,
      PATCH: AuditAction.UPDATE,
      DELETE: AuditAction.DELETE,
    };

    const action = actionMap[method];

    if (!action || !user) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        // Extract entity info from URL
        const entity = this.extractEntity(url);
        const entityId = this.extractEntityId(url) || data?.id;

        await this.prisma.auditLog.create({
          data: {
            userId: user.id,
            action,
            entity,
            entityId,
            newValues: JSON.stringify(body),
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
          },
        });
      }),
    );
  }

  private extractEntity(url: string): string {
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 2] || parts[parts.length - 1] || 'unknown';
  }

  private extractEntityId(url: string): string | null {
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = url.match(uuidRegex);
    return match ? match[0] : null;
  }
}
```

#### Manual Audit Logging

```typescript
// Example in service
async updateProduct(id: string, data: UpdateProductDto, userId: string) {
  const oldProduct = await this.prisma.product.findUnique({ where: { id } });
  
  const updated = await this.prisma.product.update({
    where: { id },
    data,
  });

  // Log the change
  await this.prisma.auditLog.create({
    data: {
      userId,
      action: AuditAction.UPDATE,
      entity: 'Product',
      entityId: id,
      oldValues: JSON.stringify(oldProduct),
      newValues: JSON.stringify(updated),
    },
  });

  return updated;
}
```

### 8.4 Data Validation

#### Backend DTOs with Validation

```typescript
// products/dto/create-product.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { ProductCategory, UnitType } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsBoolean()
  hasVariants: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  costPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sellingPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  quantityInStock?: number;

  @IsEnum(UnitType)
  @IsOptional()
  unitType?: UnitType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  lowStockThreshold?: number;

  @IsBoolean()
  @IsOptional()
  taxable?: boolean;

  @IsString()
  @IsNotEmpty()
  branchId: string;
}
```

#### Frontend Form Validation with Zod

```javascript
// Example with React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.enum(['FROZEN', 'DRINKS', 'ACCESSORIES', 'OTHER']),
  hasVariants: z.boolean(),
  costPrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  quantityInStock: z.number().min(0).optional(),
}).refine(
  (data) => {
    if (!data.hasVariants && data.sellingPrice < data.costPrice) {
      return false;
    }
    return true;
  },
  {
    message: 'Selling price must be greater than cost price',
    path: ['sellingPrice'],
  }
);

const ProductForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
  });

  const onSubmit = (data) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

### 8.5 Security Best Practices

**Backend**:
1. **Password Hashing**: Use bcrypt with salt rounds of 10
2. **SQL Injection Prevention**: Prisma ORM provides protection
3. **Rate Limiting**: Implement on login endpoint (max 5 attempts per 15 minutes)
4. **CORS**: Configure for localhost only in production
5. **Helmet**: Use helmet middleware for security headers
6. **Input Sanitization**: Validate and sanitize all inputs
7. **Error Messages**: Don't expose sensitive information in errors

**Frontend**:
1. **XSS Prevention**: React escapes by default, avoid dangerouslySetInnerHTML
2. **Token Storage**: Store JWT in memory (Zustand) or httpOnly cookies
3. **CSRF Protection**: Use tokens for state-changing operations
4. **Dependency Updates**: Regularly update packages
5. **Environment Variables**: Never commit secrets
6. **Content Security Policy**: Configure CSP headers

---

## 9. TESTING REQUIREMENTS

### 9.1 Backend Testing

#### Unit Tests (Jest)

```typescript
// products/products.service.spec.ts
describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const createDto = {
        name: 'Test Product',
        sku: 'TEST-001',
        category: ProductCategory.DRINKS,
        hasVariants: false,
        costPrice: 100,
        sellingPrice: 200,
        branchId: 'branch-id',
      };

      const mockProduct = { id: 'product-id', ...createDto };
      jest.spyOn(prisma.product, 'create').mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProduct);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw error for duplicate SKU', async () => {
      jest.spyOn(prisma.product, 'create').mockRejectedValue(
        new Error('Unique constraint failed')
      );

      await expect(service.create({})).rejects.toThrow();
    });
  });

  describe('calculateProfit', () => {
    it('should calculate profit correctly', () => {
      const profit = service.calculateProfit(200, 100, 5);
      expect(profit).toBe(500);
    });
  });
});
```

#### Integration Tests (E2E)

```typescript
// test/products.e2e-spec.ts
describe('Products (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Login and get token
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    authToken = response.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/products (POST)', () => {
    it('should create a product', () => {
      return request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          sku: 'TEST-001',
          category: 'DRINKS',
          hasVariants: false,
          costPrice: 100,
          sellingPrice: 200,
          quantityInStock: 50,
          branchId: 'branch-id',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
        });
    });

    it('should reject unauthorized access', () => {
      return request(app.getHttpServer())
        .post('/api/v1/products')
        .send({})
        .expect(401);
    });
  });
});
```

### 9.2 Frontend Testing

#### Component Tests (React Testing Library)

```jsx
// components/ProductCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Coca Cola',
    sku: 'DRINK-001',
    sellingPrice: 250,
    quantityInStock: 100,
    category: 'DRINKS',
  };

  const mockOnAddToCart = jest.fn();

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />);

    expect(screen.getByText('Coca Cola')).toBeInTheDocument();
    expect(screen.getByText('₦250.00')).toBeInTheDocument();
    expect(screen.getByText('100 in stock')).toBeInTheDocument();
  });

  it('calls onAddToCart when add button is clicked', () => {
    render(<ProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />);

    const addButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addButton);

    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('disables add button when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, quantityInStock: 0 };
    render(<ProductCard product={outOfStockProduct} onAddToCart={mockOnAddToCart} />);

    const addButton = screen.getByRole('button', { name: /add to cart/i });
    expect(addButton).toBeDisabled();
  });
});
```

#### Hook Tests

```javascript
// hooks/useCart.test.js
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '../store/cartStore';

describe('useCart', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Coca Cola',
        price: 250,
      }, null, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('should calculate total correctly', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({ id: '1', price: 250 }, null, 2);
      result.current.addItem({ id: '2', price: 100 }, null, 3);
    });

    expect(result.current.getSubtotal()).toBe(800); // (250*2) + (100*3)
  });
});
```

### 9.3 Test Coverage Requirements

**Backend**:
- Unit tests: Minimum 70% coverage
- Critical paths (auth, sales, payments): 90% coverage
- All service methods must have tests
- All DTOs must be validated

**Frontend**:
- Critical components (POS, Cart, Payment): 80% coverage
- Business logic hooks: 90% coverage
- Utility functions: 100% coverage

---

## 10. DEPLOYMENT & OPERATIONS

### 10.1 Installation Instructions

#### Prerequisites
```bash
# Required software
- Node.js v18+ (LTS recommended)
- pnpm v9+ or yarn v1.22+
- Git (for version control)
```

#### Backend Setup

```bash
# 1. Clone repository (if applicable)
git clone <repository-url>
cd pos-system/backend

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Initialize database
npx prisma migrate dev
npx prisma generate

# 5. Seed database with initial data
npx prisma db seed

# 6. Start development server
pnpm run start:dev

# Backend will run on http://localhost:3000
```

#### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd ../frontend

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env with API URL

# 4. Start development server
pnpm run dev

# Frontend will run on http://localhost:5173
```

### 10.2 Production Build

#### Backend Production

```bash
# Build
pnpm run build

# Start production server
pnpm run start:prod

# Or use PM2 for process management
pnpm install -g pm2
pm2 start dist/main.js --name pos-backend
pm2 save
pm2 startup
```

#### Frontend Production

```bash
# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Output will be in dist/ directory
```

### 10.3 Electron Packaging (Optional)

```bash
# Install Electron
pnpm install --save-dev electron electron-builder

# Create electron main file
# See electron.js configuration below

# Package for Windows
pnpm run electron:build:win

# Package for Mac
pnpm run electron:build:mac

# Package for Linux
pnpm run electron:build:linux
```

**Electron Main Process** (`electron.js`):
```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load frontend
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

function startBackend() {
  const backendPath = path.join(__dirname, 'backend/dist/main.js');
  backendProcess = spawn('node', [backendPath], {
    env: { ...process.env, PORT: 3000 },
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });
}

app.whenReady().then(() => {
  startBackend();
  setTimeout(createWindow, 2000); // Wait for backend to start
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for printer access
ipcMain.handle('print-receipt', async (event, html, options) => {
  // Implement thermal printer integration
  // Use node-thermal-printer or similar
});
```

### 10.4 Database Management

#### Backup Strategy

```bash
# Manual backup
sqlite3 pos.db ".backup 'backup-$(date +%Y%m%d-%H%M%S).db'"

# Automated backup script (add to cron)
#!/bin/bash
BACKUP_DIR="./backups"
DB_FILE="./pos.db"
RETENTION_DAYS=30

# Create backup
sqlite3 $DB_FILE ".backup '$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S)-auto.db'"

# Delete old backups
find $BACKUP_DIR -name "backup-*-auto.db" -mtime +$RETENTION_DAYS -delete
```

#### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name add_new_feature

# Apply migrations in production
npx prisma migrate deploy

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### 10.5 Logging Configuration

**Backend Logging** (`config/logger.ts`):
```typescript
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    
    // File output with rotation
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
    
    // Error logs
    new DailyRotateFile({
      level: 'error',
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});
```

### 10.6 Performance Optimization

#### Backend
1. **Database Indexing**: Already defined in schema
2. **Query Optimization**: Use `select` to fetch only needed fields
3. **Caching**: Implement Redis for frequently accessed data (future)
4. **Pagination**: Always paginate large datasets
5. **Connection Pooling**: Configure Prisma connection pool

```typescript
// prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
  
  // Connection pool configuration
  relationMode = "prisma"
}
```

#### Frontend
1. **Code Splitting**: Lazy load routes
```javascript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
```

2. **Image Optimization**: Use WebP format, lazy loading
3. **Bundle Optimization**: Analyze with `vite-bundle-visualizer`
4. **Memoization**: Use React.memo for expensive components
```jsx
export const ProductCard = React.memo(({ product, onAddToCart }) => {
  // Component logic
}, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id;
});
```

5. **Virtual Scrolling**: For large lists (use react-window)

### 10.7 Monitoring & Maintenance

#### Health Checks

```typescript
// Backend health check endpoint
@Get('health')
async healthCheck() {
  const dbHealthy = await this.prisma.$queryRaw`SELECT 1`;
  
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbHealthy ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  };
}
```

#### Maintenance Tasks
1. **Daily**:
   - Automatic database backup (2 AM)
   - Clear old logs (older than 30 days)
   - Check disk space

2. **Weekly**:
   - Review audit logs for anomalies
   - Check low stock alerts
   - Review error logs

3. **Monthly**:
   - Database optimization (VACUUM)
   - Update dependencies
   - Review performance metrics

### 10.8 Troubleshooting Guide

#### Common Issues

**Problem**: Backend won't start
```bash
# Solution 1: Check if port is in use
lsof -i :3000
# Kill process if found
kill -9 <PID>

# Solution 2: Reset database
npx prisma migrate reset
npx prisma db seed

# Solution 3: Clear node_modules
rm -rf node_modules package-lock.json
pnpm install
```

**Problem**: Database locked error (SQLite)
```bash
# Check for other processes using DB
fuser pos.db

# If safe, delete lock file
rm pos.db-shm pos.db-wal
```

**Problem**: Frontend can't connect to backend
```bash
# Check backend is running
curl http://localhost:3000/api/v1/health

# Verify VITE_API_URL in .env
cat .env | grep VITE_API_URL

# Check CORS configuration in backend
```

---

## 11. SAMPLE DATA & TESTING SCENARIOS

### 11.1 Test User Accounts

| Username | Password | Role | Purpose |
|----------|----------|------|---------|
| admin | admin123 | ADMIN | Full system access |
| cashier | cashier123 | CASHIER | POS operations only |

### 11.2 Sample Products

**Drinks Category**:
- Coca Cola 500ml (SKU: DRINK-001, Barcode: 5000112637588)
- Sprite 500ml (SKU: DRINK-002, Barcode: 5000112637595)
- Fanta 500ml (SKU: DRINK-003, Barcode: 5000112637601)

**Frozen Category**:
- Frozen Chicken (SKU: FROZEN-001, Weight-based pricing)
- Ice Cream (SKU: FROZEN-002, Piece-based)

**Accessories** (with variants):
- T-Shirt (SKU: ACC-001)
  - Variant: Small-Black (SKU: ACC-001-S-BLK)
  - Variant: Medium-Black (SKU: ACC-001-M-BLK)
  - Variant: Large-White (SKU: ACC-001-L-WHT)

### 11.3 Testing Scenarios

**Scenario 1: Complete Sale (Cash Payment)**
1. Login as cashier
2. Search "Coca"
3. Add 2x Coca Cola to cart
4. Add 1x Sprite to cart
5. Proceed to payment
6. Select Cash payment
7. Enter amount: ₦1000
8. Complete sale
9. Verify change calculated
10. Print receipt

**Scenario 2: Split Payment**
1. Add items totaling ₦5000
2. Add payment: Cash ₦3000
3. Add payment: Card ₦2000
4. Complete sale

**Scenario 3: Low Stock Alert**
1. Login as admin
2. Navigate to dashboard
3. Verify low stock widget shows products below threshold
4. Click on low stock item
5. Adjust stock (restock)
6. Verify alert cleared

**Scenario 4: Daily Report**
1. Complete multiple sales as cashier
2. Login as admin
3. Navigate to Reports
4. Select "Sales Report"
5. Set date range to "Today"
6. Verify sales data displayed correctly
7. Export as PDF
8. Verify PDF contains correct data

**Scenario 5: Audit Trail**
1. Login as admin
2. Create new product
3. Update product price
4. Navigate to Audit Logs
5. Verify both CREATE and UPDATE actions logged
6. Click on UPDATE log
7. Verify old and new values shown

---

## 12. ADDITIONAL REQUIREMENTS

### 12.1 Code Quality Standards

#### Backend
- Use TypeScript strict mode
- ESLint configuration with Airbnb style guide
- Prettier for code formatting
- Commit hooks with Husky for pre-commit linting
- Comments for complex business logic
- JSDoc for public methods

#### Frontend
- ESLint with React recommended rules
- Prettier configuration
- PropTypes or TypeScript for component props
- Consistent naming conventions:
  - Components: PascalCase
  - Files: PascalCase for components, camelCase for utilities
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE

### 12.2 Documentation Requirements

**Must Include**:
1. README.md with:
   - Project overview
   - Installation instructions
   - Configuration guide
   - Usage examples
   - Troubleshooting section

2. API Documentation:
   - Swagger/OpenAPI spec
   - Generated with @nestjs/swagger
   - Accessible at `/api/docs`

3. Developer Guide:
   - Architecture overview
   - Database schema diagram
   - Flow diagrams for key processes
   - Contributing guidelines

4. User Manual:
   - Admin guide
   - Cashier guide
   - Screenshots of key features
   - FAQ section

### 12.3 Git Workflow

```bash
# Branch naming
feature/add-product-variants
bugfix/fix-stock-calculation
hotfix/security-patch

# Commit message format
type(scope): subject

# Types: feat, fix, docs, style, refactor, test, chore
# Example:
feat(products): add barcode generation functionality
fix(sales): correct tax calculation for weighted items
docs(api): update authentication endpoint documentation
```

### 12.4 Future Enhancements Roadmap

**Phase 2**:
- Cloud synchronization between branches
- Customer loyalty program
- Discount and promotion engine
- Returns and refunds module
- Multi-currency support

**Phase 3**:
- Mobile app (React Native)
- Customer-facing display
- Online ordering integration
- Advanced analytics and forecasting
- Email/SMS notifications

**Phase 4**:
- Multi-tenant SaaS platform
- API for third-party integrations
- AI-powered inventory predictions
- Automated reordering

---

## 13. IMPLEMENTATION CHECKLIST

### Backend Tasks
- [ ] Initialize NestJS project
- [ ] Configure Prisma with SQLite
- [ ] Define complete database schema
- [ ] Create and run migrations
- [ ] Implement authentication (JWT)
- [ ] Create all CRUD endpoints
- [ ] Implement role-based guards
- [ ] Add audit logging interceptor
- [ ] Implement automated backups
- [ ] Create seeding script
- [ ] Add input validation (DTOs)
- [ ] Configure logging (Winston)
- [ ] Set up Swagger documentation
- [ ] Write unit tests (70% coverage)
- [ ] Write E2E tests for critical paths
- [ ] Configure production build

### Frontend Tasks
- [ ] Initialize Vite + React project
- [ ] Configure TailwindCSS
- [ ] Set up routing (React Router)
- [ ] Configure state management (Zustand + React Query)
- [ ] Create design system components
- [ ] Implement authentication flow
- [ ] Build admin dashboard
- [ ] Build POS interface
- [ ] Create product management pages
- [ ] Build inventory management interface
- [ ] Create reports page with charts
- [ ] Implement expense tracking
- [ ] Build user management interface
- [ ] Create audit log viewer
- [ ] Implement settings page
- [ ] Build backup/restore interface
- [ ] Add receipt generation (HTML + PDF)
- [ ] Implement barcode scanning
- [ ] Add barcode generation
- [ ] Create print service
- [ ] Implement export functionality (Excel/PDF)
- [ ] Add dark mode toggle
- [ ] Implement toast notifications
- [ ] Add loading states and skeletons
- [ ] Write component tests
- [ ] Configure production build
- [ ] Optimize bundle size

### Integration & Testing
- [ ] Test authentication flow end-to-end
- [ ] Test complete sale process
- [ ] Test inventory adjustments
- [ ] Test report generation
- [ ] Test backup and restore
- [ ] Test all user permissions
- [ ] Test offline functionality
- [ ] Performance testing (load times)
- [ ] Cross-browser testing
- [ ] Responsive design testing (desktop/tablet)
- [ ] Print receipt testing
- [ ] Barcode scanning testing

### Documentation & Deployment
- [ ] Write README.md
- [ ] Create API documentation
- [ ] Write user manual
- [ ] Create developer guide
- [ ] Add code comments
- [ ] Configure production environment
- [ ] Create installer (Electron)
- [ ] Package for distribution
- [ ] Create deployment guide
- [ ] Prepare training materials

---

## 14. CODE EXAMPLES & TEMPLATES

### 14.1 Complete Backend Service Example

```typescript
// products/products.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new product
   */
  async create(data: CreateProductDto) {
    try {
      // Check if SKU already exists
      const existing = await this.prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (existing) {
        throw new ConflictException('Product with this SKU already exists');
      }

      // Create product
      const product = await this.prisma.product.create({
        data: {
          ...data,
          isActive: true,
        },
        include: {
          variants: true,
        },
      });

      return product;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  /**
   * Get all products with filtering and pagination
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
    category?: string;
    isActive?: boolean;
    hasVariants?: boolean;
    lowStock?: boolean;
    branchId?: string;
  }) {
    const {
      skip = 0,
      take = 20,
      search,
      category,
      isActive,
      hasVariants,
      lowStock,
      branchId,
    } = params;

    const where: Prisma.ProductWhereInput = {
      branchId,
      ...(isActive !== undefined && { isActive }),
      ...(category && { category: category as any }),
      ...(hasVariants !== undefined && { hasVariants }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
          { barcode: { contains: search } },
        ],
      }),
    };

    // Add low stock filter
    if (lowStock) {
      where.AND = [
        {
          OR: [
            {
              AND: [
                { hasVariants: false },
                { quantityInStock: { lte: Prisma.raw('lowStockThreshold') } },
              ],
            },
            {
              hasVariants: true,
              variants: {
                some: {
                  quantityInStock: { lte: Prisma.raw('lowStockThreshold') },
                },
              },
            },
          ],
        },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          variants: true,
          branch: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        lastPage: Math.ceil(total / take),
      },
    };
  }

  /**
   * Get single product by ID
   */
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        branch: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  /**
   * Update product
   */
  async update(id: string, data: UpdateProductDto, userId: string) {
    const product = await this.findOne(id);

    // Store old values for audit
    const oldValues = { ...product };

    const updated = await this.prisma.product.update({
      where: { id },
      data,
      include: { variants: true },
    });

    // Log audit trail
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entity: 'Product',
        entityId: id,
        oldValues: JSON.stringify(oldValues),
        newValues: JSON.stringify(updated),
      },
    });

    return updated;
  }

  /**
   * Soft delete product
   */
  async remove(id: string, userId: string) {
    const product = await this.findOne(id);

    const deleted = await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    // Log audit trail
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        entity: 'Product',
        entityId: id,
      },
    });

    return deleted;
  }

  /**
   * Check stock availability
   */
  async checkStock(productId: string, variantId?: string, quantity: number = 1) {
    if (variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
      });

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      return variant.quantityInStock >= quantity;
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.hasVariants) {
      throw new Error('Product has variants, please specify variantId');
    }

    return product.quantityInStock >= quantity;
  }

  /**
   * Adjust stock (manual adjustment)
   */
  async adjustStock(params: {
    productId: string;
    variantId?: string;
    quantityChange: number;
    changeType: string;
    reason?: string;
    notes?: string;
    userId: string;
  }) {
    const { productId, variantId, quantityChange, changeType, reason, notes, userId } = params;

    if (variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
      });

      if (!variant) {
        throw new NotFoundException('Variant not found');
      }

      const newQuantity = variant.quantityInStock + quantityChange;

      if (newQuantity < 0) {
        throw new Error('Insufficient stock');
      }

      // Update variant stock
      const updated = await this.prisma.productVariant.update({
        where: { id: variantId },
        data: { quantityInStock: newQuantity },
      });

      // Create inventory log
      await this.prisma.inventoryLog.create({
        data: {
          productId,
          variantId,
          changeType: changeType as any,
          quantityChange,
          previousQuantity: variant.quantityInStock,
          newQuantity,
          reason,
          notes,
        },
      });

      return updated;
    }

    // Handle product without variants
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.hasVariants) {
      throw new Error('Invalid product');
    }

    const newQuantity = product.quantityInStock + quantityChange;

    if (newQuantity < 0) {
      throw new Error('Insufficient stock');
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { quantityInStock: newQuantity },
    });

    await this.prisma.inventoryLog.create({
      data: {
        productId,
        changeType: changeType as any,
        quantityChange,
        previousQuantity: product.quantityInStock,
        newQuantity,
        reason,
        notes,
      },
    });

    return updated;
  }

  /**
   * Get low stock products
   */
  async getLowStock(branchId: string) {
    const products = await this.prisma.product.findMany({
      where: {
        branchId,
        isActive: true,
        hasVariants: false,
        quantityInStock: {
          lte: Prisma.raw('lowStockThreshold'),
        },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        quantityInStock: true,
        lowStockThreshold: true,
        unitType: true,
      },
    });

    const variants = await this.prisma.productVariant.findMany({
      where: {
        isActive: true,
        quantityInStock: {
          lte: Prisma.raw('lowStockThreshold'),
        },
        product: {
          branchId,
          isActive: true,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      products,
      variants,
    };
  }

  /**
   * Generate unique barcode
   */
  generateBarcode(): string {
    const prefix = '200'; // Internal use prefix
    const random = Math.floor(Math.random() * 1000000000)
      .toString()
      .padStart(9, '0');
    const code = prefix + random;

    // Calculate EAN-13 check digit
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(code[i]);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;

    return code + checkDigit;
  }
}
```

### 14.2 Complete Frontend Component Example

```jsx
// components/pos/Cart.jsx
import React, { useMemo } from 'react';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../common/Button';

export const Cart = ({ onCheckout }) => {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();

  const summary = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + (item.taxable ? itemSubtotal * item.taxRate : 0);
    }, 0);
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  }, [items]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <ShoppingCart className="w-16 h-16 text-neutral-300 mb-4" />
        <h3 className="text-lg font-medium text-neutral-600 mb-2">Cart is Empty</h3>
        <p className="text-sm text-neutral-500">Add products to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-neutral-600" />
          <h2 className="text-lg font-semibold">Cart</h2>
          <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="text-red-600 hover:bg-red-50"
        >
          Clear All
        </Button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onQuantityChange={handleQuantityChange}
            onRemove={removeItem}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-neutral-200 p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(summary.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Tax:</span>
            <span className="font-medium">{formatCurrency(summary.taxAmount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-neutral-200">
            <span>Total:</span>
            <span className="text-primary-600">{formatCurrency(summary.total)}</span>
          </div>
        </div>

        <Button
          onClick={() => onCheckout(summary)}
          className="w-full"
          size="lg"
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
};

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const itemTotal = item.quantity * item.unitPrice;

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-sm text-neutral-900">{item.name}</h4>
          {item.variantName && (
            <p className="text-xs text-neutral-500">{item.variantName}</p>
          )}
          <p className="text-xs text-neutral-400 mt-1">SKU: {item.sku}</p>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            className="p-1 rounded border border-neutral-300 hover:bg-neutral-100 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => onQuantityChange(item.id, parseFloat(e.target.value) || 0)}
            className="w-16 text-center text-sm font-medium border border-neutral-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            min="0"
            step={item.unitType === 'WEIGHT' ? '0.1' : '1'}
          />
          <button
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            className="p-1 rounded border border-neutral-300 hover:bg-neutral-100 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Price */}
        <div className="text-right">
          <p className="text-xs text-neutral-500">
            {formatCurrency(item.unitPrice)} × {item.quantity}
          </p>
          <p className="font-semibold text-neutral-900">{formatCurrency(itemTotal)}</p>
        </div>
      </div>

      {/* Stock Warning */}
      {item.quantity > item.availableStock && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          ⚠️ Only {item.availableStock} available in stock
        </div>
      )}
    </div>
  );
};
```

### 14.3 Payment Modal Component

```jsx
// components/pos/PaymentModal.jsx
import React, { useState } from 'react';
import { X, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatCurrency } from '../../utils/formatters';

export const PaymentModal = ({ isOpen, onClose, total, onComplete }) => {
  const [payments, setPayments] = useState([]);
  const [activeMethod, setActiveMethod] = useState('CASH');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { value: 'CASH', label: 'Cash', icon: Banknote },
    { value: 'CARD', label: 'Card', icon: CreditCard },
    { value: 'TRANSFER', label: 'Transfer', icon: Smartphone },
  ];

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - totalPaid;
  const change = totalPaid > total ? totalPaid - total : 0;

  const handleAddPayment = () => {
    const paymentAmount = parseFloat(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (activeMethod !== 'CASH' && !reference.trim()) {
      alert('Please enter a reference number');
      return;
    }

    const newPayment = {
      id: Date.now(),
      method: activeMethod,
      amount: paymentAmount,
      reference: reference || null,
    };

    setPayments([...payments, newPayment]);
    setAmount('');
    setReference('');
  };

  const handleRemovePayment = (id) => {
    setPayments(payments.filter((p) => p.id !== id));
  };

  const handleCompleteSale = async () => {
    if (remaining > 0) {
      alert(`Insufficient payment. ₦${remaining.toFixed(2)} remaining.`);
      return;
    }

    setIsProcessing(true);
    try {
      await onComplete({
        payments,
        totalPaid,
        change,
      });
    } catch (error) {
      alert('Failed to complete sale: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick cash amounts for fast checkout
  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Due */}
        <div className="bg-primary-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-600">Total Amount:</span>
            <span className="text-2xl font-bold text-primary-600">
              {formatCurrency(total)}
            </span>
          </div>
          {totalPaid > 0 && (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-600">Paid:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(totalPaid)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-neutral-600">
                  {remaining > 0 ? 'Remaining:' : 'Change:'}
                </span>
                <span className={`font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(Math.abs(remaining))}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Payment Method Tabs */}
        <div className="flex gap-2 mb-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.value}
                onClick={() => setActiveMethod(method.value)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  activeMethod === method.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{method.label}</span>
              </button>
            );
          })}
        </div>

        {/* Payment Input */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Amount
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              step="0.01"
              min="0"
              className="text-lg"
              autoFocus
            />
          </div>

          {/* Quick Amount Buttons (Cash only) */}
          {activeMethod === 'CASH' && (
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className="px-3 py-1 text-sm bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-300 transition-colors"
                >
                  {formatCurrency(amt)}
                </button>
              ))}
              <button
                onClick={() => setAmount(total.toString())}
                className="px-3 py-1 text-sm bg-primary-100 hover:bg-primary-200 text-primary-700 rounded border border-primary-300 transition-colors font-medium"
              >
                Exact
              </button>
            </div>
          )}

          {/* Reference Number (for Card and Transfer) */}
          {activeMethod !== 'CASH' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Reference Number
              </label>
              <Input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Enter transaction reference"
              />
            </div>
          )}

          <Button onClick={handleAddPayment} variant="secondary" className="w-full">
            Add Payment
          </Button>
        </div>

        {/* Payment List */}
        {payments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-neutral-700 mb-2">Payments Added:</h3>
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{payment.method}</span>
                    {payment.reference && (
                      <span className="text-xs text-neutral-500 ml-2">
                        Ref: {payment.reference}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                    <button
                      onClick={() => handleRemovePayment(payment.id)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleCompleteSale}
            disabled={remaining > 0 || payments.length === 0 || isProcessing}
            className="flex-1"
            isLoading={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Complete Sale'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

---

## 15. FINAL NOTES & BEST PRACTICES

### 15.1 Performance Optimization Tips

1. **Database Queries**:
   - Always use indexes on frequently queried fields
   - Use `select` to fetch only needed columns
   - Implement cursor-based pagination for large datasets
   - Use database transactions for multi-step operations

2. **Frontend Rendering**:
   - Implement virtual scrolling for large lists
   - Lazy load heavy components
   - Debounce search inputs (300ms)
   - Memoize expensive calculations
   - Use React.memo for pure components

3. **Bundle Size**:
   - Code split by route
   - Tree-shake unused code
   - Compress images and assets
   - Use dynamic imports for heavy libraries

### 15.2 Security Checklist

- [ ] All passwords hashed with bcrypt (10 rounds minimum)
- [ ] JWT tokens expire after 24 hours
- [ ] Refresh tokens implemented
- [ ] Rate limiting on authentication endpoints
- [ ] Input validation on all endpoints (DTOs)
- [ ] SQL injection protected (Prisma ORM)
- [ ] XSS protected (React escaping)
- [ ] CORS configured properly
- [ ] Security headers configured (Helmet)
- [ ] Sensitive data not logged
- [ ] Error messages don't expose system details
- [ ] Role-based access control enforced
- [ ] Audit logging for all critical actions

### 15.3 Common Pitfalls to Avoid

1. **Database**:
   - Don't use `SELECT *` - specify needed columns
   - Don't forget to add indexes
   - Don't perform heavy computations in queries
   - Always use transactions for multi-table updates

2. **Backend**:
   - Don't expose internal errors to clients
   - Don't skip input validation
   - Don't log sensitive information
   - Don't use synchronous operations in async context

3. **Frontend**:
   - Don't store sensitive data in localStorage
   - Don't skip error handling in async operations
   - Don't forget loading and error states
   - Don't mutate state directly (use immutable updates)

4. **General**:
   - Don't skip testing
   - Don't commit environment files
   - Don't use hardcoded values
   - Don't skip code reviews

### 15.4 Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "christian-kohler.path-intellisense",
    "eamodio.gitlens"
  ]
}
```

### 15.5 Project Success Criteria

**Functional Requirements Met**:
- ✅ User authentication and role-based access
- ✅ Complete product and inventory management
- ✅ Full POS functionality with barcode support
- ✅ Multi-payment processing
- ✅ Receipt generation and printing
- ✅ Comprehensive reporting
- ✅ Expense tracking
- ✅ Audit logging
- ✅ Automated backups
- ✅ Offline operation
- ✅ Dark mode support

**Non-Functional Requirements Met**:
- ✅ Response time < 500ms for local operations
- ✅ Intuitive, responsive UI
- ✅ Code coverage > 70%
- ✅ Comprehensive documentation
- ✅ Secure authentication and authorization
- ✅ Data integrity and validation
- ✅ Scalable architecture

---

## 16. GLOSSARY

**Term** | **Definition**
---------|---------------
**POS** | Point of Sale - the system where transactions are completed
**SKU** | Stock Keeping Unit - unique identifier for products
**EAN-13** | European Article Number, 13-digit barcode standard
**JWT** | JSON Web Token - authentication token format
**CRUD** | Create, Read, Update, Delete operations
**DTO** | Data Transfer Object - object for API request/response
**ORM** | Object-Relational Mapping - database abstraction layer
**VAT** | Value Added Tax
**COGS** | Cost of Goods Sold
**Gross Profit** | Revenue minus COGS
**Net Profit** | Gross profit minus expenses
**Split Payment** | Payment using multiple methods (cash + card)
**Thermal Printer** | Receipt printer using heat-sensitive paper
**Soft Delete** | Marking record as inactive instead of removing
**Audit Trail** | Log of all system changes
**Seed Data** | Initial data for testing/development
**Migration** | Database schema version change
**Barcode Scanner** | Device to read product barcodes
**Variant** | Product variation (size, color, etc.)
**Low Stock Threshold** | Quantity level that triggers alert
**Inventory Log** | History of stock changes
**Receipt Number** | Unique transaction identifier

---

## 17. QUICK START GUIDE

### For Developers

**Day 1: Setup**
```bash
# Backend setup
cd backend
pnpm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
pnpm run start:dev

# Frontend setup (new terminal)
cd frontend
pnpm install
cp .env.example .env
pnpm run dev
```

**Day 2: Familiarize**
- Explore database schema in Prisma Studio: `npx prisma studio`
- Review API documentation: `http://localhost:3000/api/docs`
- Login with test credentials (admin/admin123)
- Test POS flow as cashier (cashier/cashier123)

**Day 3: Development**
- Pick a feature from the checklist
- Write tests first (TDD approach)
- Implement feature
- Test manually
- Submit PR

### For Users

**Admin First-Time Setup**
1. Login with default admin credentials
2. Go to Settings → Branch Information
3. Update business details
4. Set tax rate
5. Customize receipt footer
6. Create cashier accounts
7. Add products to inventory

**Cashier Daily Workflow**
1. Login with cashier credentials
2. Navigate to POS interface
3. Search or scan products
4. Add items to cart
5. Proceed to payment
6. Accept payment(s)
7. Print receipt
8. View daily sales summary

---

## 18. TROUBLESHOOTING SCENARIOS

### Scenario 1: Database is locked
**Symptoms**: Error "database is locked" when performing operations

**Solution**:
```bash
# Close all connections to database
# If using Prisma Studio, close it
# Check for other processes
lsof | grep pos.db

# If safe, remove lock files
rm pos.db-shm pos.db-wal

# Restart backend
pnpm run start:dev
```

### Scenario 2: Cannot login after password change
**Symptoms**: Login fails with correct credentials after password update

**Cause**: Password not hashed properly

**Solution**:
```bash
# Reset password via Prisma Studio
npx prisma studio
# Or use seed script to recreate user
npx prisma db seed
```

### Scenario 3: Reports showing wrong calculations
**Symptoms**: Profit/loss numbers don't match expectations

**Debugging Steps**:
1. Check if costPrice is set for all products
2. Verify tax calculations in sales
3. Check expense entries for period
4. Review inventory logs for adjustments
5. Use audit logs to trace changes

### Scenario 4: Barcode scanner not working
**Symptoms**: Scanned barcodes not appearing in search

**Checklist**:
- [ ] Scanner properly connected
- [ ] Scanner configured for keyboard mode
- [ ] Search input has focus
- [ ] Barcode exists in database
- [ ] Barcode format matches (EAN-13)

### Scenario 5: Slow performance
**Symptoms**: Operations taking longer than 2 seconds

**Investigation**:
```bash
# Check database size
ls -lh pos.db

# If > 100MB, consider:
# 1. Archive old data
# 2. Optimize database
sqlite3 pos.db "VACUUM;"

# Check for missing indexes
# Review slow query logs
```

### Scenario 6: Receipt not printing
**Symptoms**: Print dialog doesn't open or printer not responding

**Solutions**:
1. **Browser print**: Ensure popups not blocked
2. **Thermal printer**: Check printer connection and driver
3. **Electron**: Verify printer configuration in settings
4. **Fallback**: Download PDF receipt instead

---

## 19. MIGRATION GUIDES

### From SQLite to PostgreSQL (Future)

When scaling to cloud, migrate to PostgreSQL:

**Step 1: Update Prisma Schema**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Step 2: Export SQLite Data**
```bash
# Export to SQL
sqlite3 pos.db .dump > dump.sql

# Clean up SQLite-specific syntax for PostgreSQL
# Replace: INTEGER PRIMARY KEY AUTOINCREMENT
# With: SERIAL PRIMARY KEY
```

**Step 3: Import to PostgreSQL**
```bash
# Create new database
createdb pos_production

# Import data
psql pos_production < dump.sql

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@localhost:5432/pos_production"
```

**Step 4: Run Migrations**
```bash
npx prisma migrate deploy
npx prisma generate
```

**Step 5: Verify**
- Test all operations
- Verify data integrity
- Check query performance
- Update backup scripts

---

## 20. ADVANCED FEATURES (FUTURE)

### Cloud Synchronization Architecture

**Approach: Event-Driven Sync**

```typescript
// Sync event structure
interface SyncEvent {
  id: string;
  branchId: string;
  entityType: 'product' | 'sale' | 'inventory';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  synced: boolean;
  syncedAt?: Date;
}

// Sync queue
class SyncQueue {
  async addToQueue(event: SyncEvent) {
    // Store in local queue
    await this.prisma.syncEvent.create({ data: event });
  }

  async sync() {
    // Get unsynced events
    const events = await this.prisma.syncEvent.findMany({
      where: { synced: false },
      orderBy: { timestamp: 'asc' },
    });

    // Send to cloud
    for (const event of events) {
      try {
        await this.cloudAPI.sync(event);
        await this.markSynced(event.id);
      } catch (error) {
        // Retry logic
      }
    }
  }
}
```

**Conflict Resolution**:
- Last-write-wins for inventory
- Merge for non-conflicting changes
- Manual resolution for sales (shouldn't conflict)

### Customer Loyalty Program

```typescript
// Customer model
model Customer {
  id            String   @id @default(uuid())
  phone         String   @unique
  name          String
  email         String?
  loyaltyPoints Int      @default(0)
  totalSpent    Float    @default(0)
  sales         Sale[]
}

// Points calculation
const pointsEarned = Math.floor(saleTotal / 100); // 1 point per ₦100
await prisma.customer.update({
  where: { id: customerId },
  data: {
    loyaltyPoints: { increment: pointsEarned },
    totalSpent: { increment: saleTotal },
  },
});
```

### Multi-Currency Support

```typescript
// Currency conversion
interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  updatedAt: Date;
}

const convertCurrency = (amount: number, from: string, to: string) => {
  const rate = getExchangeRate(from, to);
  return amount * rate;
};

// Display in multiple currencies
{formatCurrency(amount, 'NGN')} / {formatCurrency(convertCurrency(amount, 'NGN', 'USD'), 'USD')}
```

---

## 21. APPENDIX

### A. Environment Variables Reference

**Backend (.env)**
```env
# Server Configuration
NODE_ENV=development|production
PORT=3000
API_PREFIX=api/v1

# Database
DATABASE_URL=file:./pos.db

# Authentication
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRATION=7d
BCRYPT_ROUNDS=10

# Backup
BACKUP_ENABLED=true
BACKUP_INTERVAL=24h
BACKUP_RETENTION_DAYS=30
BACKUP_PATH=./backups

# Logging
LOG_LEVEL=info|debug|warn|error
LOG_PATH=./logs
LOG_MAX_FILES=30d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_TTL=900
RATE_LIMIT_MAX=100
```

**Frontend (.env)**
```env
# API Configuration
VITE_API_URL=http://localhost:3000/api/v1

# Application
VITE_APP_NAME=POS System
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_DEV_TOOLS=true
VITE_ENABLE_BARCODE_SCANNER=true
```

### B. Database Backup Script

```bash
#!/bin/bash
# backup.sh

# Configuration
DB_FILE="./pos.db"
BACKUP_DIR="./backups"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Perform backup
sqlite3 $DB_FILE ".backup '$BACKUP_DIR/backup-$DATE-auto.db'"

# Compress backup
gzip "$BACKUP_DIR/backup-$DATE-auto.db"

# Calculate size
SIZE=$(du -h "$BACKUP_DIR/backup-$DATE-auto.db.gz" | cut -f1)

echo "✅ Backup completed: backup-$DATE-auto.db.gz ($SIZE)"

# Delete old backups
find $BACKUP_DIR -name "backup-*-auto.db.gz" -mtime +$RETENTION_DAYS -delete

echo "🗑️  Deleted backups older than $RETENTION_DAYS days"

# Optional: Upload to cloud storage
# aws s3 cp "$BACKUP_DIR/backup-$DATE-auto.db.gz" s3://my-bucket/backups/
```

**Cron Job Setup**:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh >> /path/to/backup.log 2>&1
```

### C. Package.json Scripts Reference

**Backend**:
```json
{
  "scripts": {
    "start": "node dist/main",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\"",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "prisma:seed": "prisma db seed",
    "db:backup": "./scripts/backup.sh",
    "db:restore": "./scripts/restore.sh"
  }
}
```

**Frontend**:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{js,jsx,json,css}\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### D. Git Hooks (Husky)

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run linter
pnpm run lint

# Run tests
pnpm run test

# Format code
pnpm run format
```

### E. Docker Configuration (Optional)

**Dockerfile (Backend)**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm ci --only=production

# Generate Prisma Client
RUN npx prisma generate

# Copy source
COPY . .

# Build
RUN pnpm run build

# Expose port
EXPOSE 3000

# Start
CMD ["pnpm", "run", "start:prod"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    volumes:
      - ./backend/pos.db:/app/pos.db
      - ./backend/backups:/app/backups
      - ./backend/logs:/app/logs
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./pos.db
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

---

## 22. SUCCESS METRICS & KPIs

### Technical Metrics
- **Uptime**: > 99.9%
- **Response Time**: < 500ms (p95)
- **Error Rate**: < 0.1%
- **Code Coverage**: > 70%
- **Build Time**: < 2 minutes
- **Bundle Size**: < 500KB (gzipped)

### Business Metrics
- **Transaction Time**: < 2 minutes per sale
- **User Satisfaction**: > 4/5 rating
- **Data Accuracy**: 100% (no data loss)
- **Training Time**: < 2 hours for new users
- **System Reliability**: Zero critical bugs in production

### Performance Benchmarks
- **Product Search**: < 100ms
- **Sale Completion**: < 1s
- **Report Generation**: < 3s
- **Backup Creation**: < 10s
- **Database Query**: < 50ms (average)

---

## 23. FINAL CHECKLIST

Before considering the project complete, verify:

### Core Functionality
- [ ] Users can login and logout
- [ ] Admins can manage products and variants
- [ ] Admins can manage users
- [ ] Cashiers can complete sales
- [ ] Multiple payment methods work
- [ ] Receipts generate correctly
- [ ] Stock deducts automatically
- [ ] Low stock alerts appear
- [ ] Reports generate accurately
- [ ] Expenses can be tracked
- [ ] Audit logs record all actions
- [ ] Backups run automatically

### Quality Assurance
- [ ] All tests pass
- [ ] No console errors in production
- [ ] Responsive on tablet and desktop
- [ ] Dark mode works correctly
- [ ] Forms validate properly
- [ ] Error messages are user-friendly
- [ ] Loading states show appropriately
- [ ] Confirmation dialogs prevent accidents

### Security
- [ ] Passwords are hashed
- [ ] JWT tokens expire properly
- [ ] Role-based access enforced
- [ ] SQL injection protected
- [ ] XSS protected
- [ ] Rate limiting active
- [ ] Sensitive data not logged
- [ ] HTTPS ready (for production)

### Performance
- [ ] Page load time < 2s
- [ ] Search responds < 200ms
- [ ] No memory leaks detected
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] Bundle size acceptable
- [ ] Lighthouse score > 90

### Documentation
- [ ] README complete
- [ ] API documented
- [ ] Code comments added
- [ ] User guide written
- [ ] Deployment guide ready
- [ ] Troubleshooting guide included

### Production Readiness
- [ ] Environment variables configured
- [ ] Logging properly set up
- [ ] Backup strategy tested
- [ ] Monitoring in place
- [ ] Error tracking configured
- [ ] Rollback plan ready
- [ ] Support contacts documented

---

## 24. CONCLUSION

This comprehensive specification provides everything needed to build a production-ready, offline-first POS system. The system is designed with:

✅ **Performance** as the top priority
✅ **Security** built-in from the start
✅ **Maintainability** through clean architecture
✅ **Scalability** for future cloud expansion
✅ **User Experience** optimized for daily operations
✅ **Data Integrity** through comprehensive audit trails
✅ **Reliability** via automated backups and error handling

### Next Steps

1. **Development**: Follow the implementation checklist systematically
2. **Testing**: Write tests as you develop (TDD approach)
3. **Documentation**: Keep docs updated with code changes
4. **Review**: Regular code reviews ensure quality
5. **Deployment**: Test thoroughly before production
6. **Training**: Prepare users before launch
7. **Support**: Monitor and respond to issues quickly
8. **Iterate**: Gather feedback and improve continuously

### Support & Resources

- **Technical Issues**: Check troubleshooting guide
- **Feature Requests**: Document and prioritize
- **Bug Reports**: Use issue tracker with reproduction steps
- **Performance Issues**: Profile and optimize specific bottlenecks
- **Security Concerns**: Address immediately with patches

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintained By**: Development Team  

**License**: [Specify your license]  
**Contact**: [Your contact information]

---

*This specification is a living document and should be updated as the system evolves. All stakeholders should review changes and provide feedback.*# MASTER PROMPT: Multi-Branch POS System Generator

## TABLE OF CONTENTS
1. [System Overview](#system-overview)
2. [Design System & UI Guidelines](#design-system)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema](#database-schema)
5. [API Specifications](#api-specifications)
6. [Business Logic](#business-logic)
7. [Frontend Implementation](#frontend-implementation)
8. [Security & Audit](#security-audit)
9. [Testing Requirements](#testing-requirements)
10. [Deployment & Operations](#deployment-operations)

---

## 1. SYSTEM OVERVIEW

### Purpose
Build a local-first Point of Sale (POS) system for retail businesses with multiple branches. Each branch operates independently with full offline capability.

### Core Principles
- **Performance First**: Optimized for speed and reliability
- **Offline-First**: No internet dependency
- **Audit-Ready**: Complete action logging
- **Themeable**: Easy brand customization
- **Maintainable**: Clean, documented code

### Key Capabilities
- Multi-branch inventory management
- Product variants support
- Point of sale with barcode scanning/generation
- Role-based access control
- Comprehensive audit logging
- Automated backups
- Receipt generation (thermal + PDF)
- Multi-payment processing
- Real-time reporting and analytics

---

## 2. DESIGN SYSTEM & UI GUIDELINES

### 2.1 Color System (CSS Variables)

**Purpose**: Enable easy brand customization through CSS variable overrides.

```css
:root {
  /* Primary Brand Colors */
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-200: #bae6fd;
  --color-primary-300: #7dd3fc;
  --color-primary-400: #38bdf8;
  --color-primary-500: #0ea5e9;
  --color-primary-600: #0284c7;
  --color-primary-700: #0369a1;
  --color-primary-800: #075985;
  --color-primary-900: #0c4a6e;
  
  /* Neutral Colors */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-300: #d4d4d4;
  --color-neutral-400: #a3a3a3;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;
  
  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Background & Surface */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --surface-elevated: #ffffff;
  --surface-overlay: rgba(0, 0, 0, 0.5);
  
  /* Text Colors */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --text-inverse: #ffffff;
  
  /* Borders & Dividers */
  --border-primary: #e5e7eb;
  --border-secondary: #d1d5db;
  --border-focus: var(--color-primary-500);
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Dark Mode */
.dark {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --bg-tertiary: #374151;
  --surface-elevated: #1f2937;
  --surface-overlay: rgba(0, 0, 0, 0.7);
  
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-tertiary: #9ca3af;
  
  --border-primary: #374151;
  --border-secondary: #4b5563;
}
```

### 2.2 Typography

**Font Family**: System font stack for optimal performance
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

**Type Scale**:
- Display: 3rem (48px) - weight: 700
- H1: 2.25rem (36px) - weight: 700
- H2: 1.875rem (30px) - weight: 600
- H3: 1.5rem (24px) - weight: 600
- H4: 1.25rem (20px) - weight: 600
- Body Large: 1.125rem (18px) - weight: 400
- Body: 1rem (16px) - weight: 400
- Body Small: 0.875rem (14px) - weight: 400
- Caption: 0.75rem (12px) - weight: 400

### 2.3 Spacing System

Use Tailwind's spacing scale (based on 0.25rem/4px):
- xs: 0.5rem (8px)
- sm: 0.75rem (12px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

### 2.4 Component Design Patterns

#### Buttons
```jsx
// Primary Button
className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

// Secondary Button
className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2"

// Danger Button
className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"

// Icon Button
className="p-2 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
```

#### Input Fields
```jsx
// Text Input
className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-100 disabled:cursor-not-allowed"

// With Icon
<div className="relative">
  <input className="pl-10 ..." />
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
</div>
```

#### Cards
```jsx
className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 p-6"
```

#### Modals
```jsx
// Overlay
className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"

// Modal Container
className="fixed inset-0 z-50 flex items-center justify-center p-4"

// Modal Content
className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
```

#### Tables
```jsx
// Table Container
className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700"

// Table
className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700"

// Table Header
className="bg-neutral-50 dark:bg-neutral-900"

// Table Header Cell
className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"

// Table Body
className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700"

// Table Cell
className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100"
```

### 2.5 Layout Structure

#### Dashboard Layout
```
┌─────────────────────────────────────────┐
│           Top Navigation Bar            │ 64px height
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │      Main Content Area       │
│  256px   │                              │
│  width   │      (Scrollable)            │
│          │                              │
└──────────┴──────────────────────────────┘
```

#### POS Layout (Cashier Interface)
```
┌─────────────────────────────────────────┐
│         Header (Branch, Cashier)        │ 64px
├──────────────────────┬──────────────────┤
│                      │                  │
│   Product Search     │    Cart Panel    │
│   & Product Grid     │                  │
│                      │   (Fixed Right)  │
│   (70% width)        │   (30% width)    │
│                      │                  │
└──────────────────────┴──────────────────┘
```

### 2.6 Responsive Breakpoints
- Mobile: < 640px (stack vertically, hide sidebar)
- Tablet: 640px - 1024px (collapsible sidebar)
- Desktop: > 1024px (full layout)

### 2.7 Loading States & Feedback

#### Spinners
```jsx
// Small spinner
<svg className="animate-spin h-4 w-4 text-primary-600">...</svg>

// Large spinner
<svg className="animate-spin h-8 w-8 text-primary-600">...</svg>
```

#### Skeleton Loaders
```jsx
className="animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded"
```

#### Toast Notifications
- Position: Top-right corner
- Duration: 3-5 seconds
- Types: success (green), error (red), warning (yellow), info (blue)
- Include icon + message + dismiss button

### 2.8 Accessibility Requirements

- All interactive elements must be keyboard accessible
- Focus indicators on all focusable elements
- ARIA labels on icon-only buttons
- Proper heading hierarchy (h1 → h2 → h3)
- Color contrast ratio minimum 4.5:1 for text
- Form inputs must have associated labels
- Error messages must be announced to screen readers
- Modal traps focus until closed

### 2.9 Animation & Transitions

**Principles**: Subtle, purposeful, performant

```css
/* Standard transition timing */
transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

/* Modal entrance */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Toast notification */
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
```

---

## 3. TECHNICAL ARCHITECTURE

### 3.1 Tech Stack

#### Frontend
- **Framework**: React 18+ with functional components and hooks
- **Build Tool**: Vite 5+
- **Styling**: TailwindCSS 3+
- **State Management**: Zustand (for global state) + React Query (for server state)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Charts**: Recharts (lightweight, performant)
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **Excel Export**: xlsx
- **Barcode**: react-barcode (for generation), html5-qrcode (for scanning)

#### Backend
- **Framework**: NestJS 10+ (TypeScript)
- **ORM**: Prisma 5+
- **Database**: SQLite (production-ready configuration)
- **Authentication**: JWT + bcrypt
- **Validation**: class-validator + class-transformer
- **Logging**: Winston with daily rotate file
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

### 3.2 Project Structure

```
pos-system/
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── pipes/
│   │   │   └── utils/
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   └── app.config.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── dto/
│   │   │   │   ├── guards/
│   │   │   │   └── strategies/
│   │   │   ├── users/
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.module.ts
│   │   │   │   └── dto/
│   │   │   ├── products/
│   │   │   │   ├── products.controller.ts
│   │   │   │   ├── products.service.ts
│   │   │   │   ├── products.module.ts
│   │   │   │   └── dto/
│   │   │   ├── variants/
│   │   │   │   ├── variants.controller.ts
│   │   │   │   ├── variants.service.ts
│   │   │   │   ├── variants.module.ts
│   │   │   │   └── dto/
│   │   │   ├── sales/
│   │   │   │   ├── sales.controller.ts
│   │   │   │   ├── sales.service.ts
│   │   │   │   ├── sales.module.ts
│   │   │   │   └── dto/
│   │   │   ├── payments/
│   │   │   ├── expenses/
│   │   │   ├── inventory/
│   │   │   ├── reports/
│   │   │   ├── audit/
│   │   │   ├── backup/
│   │   │   └── branches/
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       ├── migrations/
│   │       └── seed.ts
│   ├── test/
│   ├── logs/
│   ├── backups/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Alert.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   └── ConfirmDialog.jsx
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.jsx
│   │   │   │   ├── POSLayout.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── products/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ProductForm.jsx
│   │   │   │   ├── ProductTable.jsx
│   │   │   │   ├── VariantManager.jsx
│   │   │   │   └── BarcodeGenerator.jsx
│   │   │   ├── pos/
│   │   │   │   ├── ProductSearch.jsx
│   │   │   │   ├── ProductGrid.jsx
│   │   │   │   ├── Cart.jsx
│   │   │   │   ├── CartItem.jsx
│   │   │   │   ├── PaymentModal.jsx
│   │   │   │   └── ReceiptPreview.jsx
│   │   │   ├── reports/
│   │   │   │   ├── SalesChart.jsx
│   │   │   │   ├── RevenueChart.jsx
│   │   │   │   ├── CategoryChart.jsx
│   │   │   │   └── ReportFilters.jsx
│   │   │   └── dashboard/
│   │   │       ├── StatCard.jsx
│   │   │       ├── RecentSales.jsx
│   │   │       ├── LowStockAlert.jsx
│   │   │       └── QuickActions.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── ForgotPassword.jsx
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Products.jsx
│   │   │   │   ├── Inventory.jsx
│   │   │   │   ├── Users.jsx
│   │   │   │   ├── Expenses.jsx
│   │   │   │   ├── Reports.jsx
│   │   │   │   ├── AuditLog.jsx
│   │   │   │   ├── Settings.jsx
│   │   │   │   └── Backup.jsx
│   │   │   └── cashier/
│   │   │       ├── POS.jsx
│   │   │       └── MySales.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useProducts.js
│   │   │   ├── useSales.js
│   │   │   ├── useCart.js
│   │   │   ├── useReports.js
│   │   │   ├── useTheme.js
│   │   │   └── useToast.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── auth.service.js
│   │   │   ├── product.service.js
│   │   │   ├── sale.service.js
│   │   │   ├── report.service.js
│   │   │   ├── export.service.js
│   │   │   └── print.service.js
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   ├── cartStore.js
│   │   │   ├── themeStore.js
│   │   │   └── settingsStore.js
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   └── tailwind.config.js
│   │   └── router/
│   │       └── index.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
│
└── README.md
```

### 3.3 Environment Configuration

#### Backend (.env)
```env
# Server
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

# Database
DATABASE_URL="file:./pos.db"

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRATION=7d

# Security
BCRYPT_ROUNDS=10

# Backup
BACKUP_ENABLED=true
BACKUP_INTERVAL=24h
BACKUP_RETENTION_DAYS=30

# Logging
LOG_LEVEL=info
LOG_MAX_FILES=30d
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=POS System
VITE_APP_VERSION=1.0.0
```

### 3.4 Performance Requirements

- **Page Load**: < 2 seconds (initial load)
- **Route Transitions**: < 300ms
- **API Response Time**: < 500ms (local)
- **Search Results**: < 200ms
- **Barcode Scan to Display**: < 100ms
- **Database Query Optimization**: Use indexes on frequently queried fields
- **Frontend Bundle Size**: < 500KB (gzipped, main bundle)

### 3.5 Offline Capability

- All features must work without internet
- Database runs locally (SQLite)
- Frontend served via localhost
- No external API dependencies
- Cached static assets

---

## 4. DATABASE SCHEMA

### 4.1 Prisma Schema Definition

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ============================================
// USER MANAGEMENT
// ============================================

model User {
  id           String   @id @default(uuid())
  username     String   @unique
  email        String?  @unique
  passwordHash String
  firstName    String?
  lastName     String?
  role         UserRole @default(CASHIER)
  isActive     Boolean  @default(true)
  branchId    String
  branch      Branch   @relation(fields: [branchId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([branchId])
  @@index([date])
  @@index([category])
  @@map("expenses")
}

// ============================================
// INVENTORY MANAGEMENT
// ============================================

model InventoryLog {
  id                String          @id @default(uuid())
  
  productId         String
  product           Product         @relation(fields: [productId], references: [id])
  
  variantId         String?
  variant           ProductVariant? @relation(fields: [variantId], references: [id])
  
  changeType        InventoryChangeType
  quantityChange    Float
  previousQuantity  Float
  newQuantity       Float
  
  reason            String?
  notes             String?
  
  // Reference to related transaction
  saleId            String?
  
  createdAt         DateTime        @default(now())
  
  @@index([productId])
  @@index([variantId])
  @@index([changeType])
  @@index([createdAt])
  @@map("inventory_logs")
}

enum InventoryChangeType {
  RESTOCK
  SALE
  ADJUSTMENT
  EXPIRY
  DAMAGE
  RETURN
}

// ============================================
// AUDIT & SECURITY
// ============================================

model AuditLog {
  id          String      @id @default(uuid())
  
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  
  action      AuditAction
  entity      String      // e.g., "Product", "Sale", "User"
  entityId    String?     // ID of the affected entity
  
  // Details of the change
  oldValues   String?     // JSON string
  newValues   String?     // JSON string
  
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime    @default(now())
  
  @@index([userId])
  @@index([action])
  @@index([entity])
  @@index([createdAt])
  @@map("audit_logs")
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  LOGIN_FAILED
  EXPORT
  BACKUP
  RESTORE
}

// ============================================
// SYSTEM SETTINGS & BACKUPS
// ============================================

model SystemSetting {
  id          String   @id @default(uuid())
  key         String   @unique
  value       String
  description String?
  
  updatedAt   DateTime @updatedAt
  
  @@map("system_settings")
}

model Backup {
  id          String       @id @default(uuid())
  filename    String
  filepath    String
  size        Int          // Size in bytes
  type        BackupType   @default(AUTOMATIC)
  status      BackupStatus @default(COMPLETED)
  
  createdAt   DateTime     @default(now())
  
  @@index([createdAt])
  @@map("backups")
}

enum BackupType {
  AUTOMATIC
  MANUAL
}

enum BackupStatus {
  IN_PROGRESS
  COMPLETED
  FAILED
}
```

### 4.2 Database Indexes Strategy

**Critical Indexes** (already included in schema):
- User: `username`, `branchId`
- Product: `sku`, `barcode`, `category`, `branchId`
- ProductVariant: `sku`, `barcode`, `productId`
- Sale: `receiptNumber`, `cashierId`, `branchId`, `createdAt`, `paymentStatus`
- SaleItem: `saleId`, `productId`
- Payment: `saleId`, `method`
- Expense: `branchId`, `date`, `category`
- InventoryLog: `productId`, `variantId`, `changeType`, `createdAt`
- AuditLog: `userId`, `action`, `entity`, `createdAt`

### 4.3 Database Seeding Script

Create initial data for testing and development:

```typescript
// prisma/seed.ts
import { PrismaClient, UserRole, ProductCategory, UnitType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Branch
  const branch = await prisma.branch.create({
    data: {
      name: 'Main Branch',
      location: 'Abuja, Nigeria',
      phone: '+234-800-000-0000',
      email: 'main@example.com',
      address: '123 Main Street, Abuja',
      taxRate: 0.075,
      currency: 'NGN',
      businessName: 'Demo Retail Store',
      businessAddress: '123 Main Street, Abuja, Nigeria',
      businessPhone: '+234-800-000-0000',
      receiptFooter: 'Thank you for your purchase!',
    },
  });

  console.log('✅ Branch created');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      branchId: branch.id,
    },
  });

  console.log('✅ Admin user created (username: admin, password: admin123)');

  // Create Cashier User
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const cashier = await prisma.user.create({
    data: {
      username: 'cashier',
      email: 'cashier@example.com',
      passwordHash: cashierPassword,
      firstName: 'John',
      lastName: 'Cashier',
      role: UserRole.CASHIER,
      branchId: branch.id,
    },
  });

  console.log('✅ Cashier user created (username: cashier, password: cashier123)');

  // Create Sample Products
  const products = await Promise.all([
    // Simple product without variants
    prisma.product.create({
      data: {
        name: 'Coca Cola 500ml',
        sku: 'DRINK-001',
        barcode: '5000112637588',
        category: ProductCategory.DRINKS,
        hasVariants: false,
        costPrice: 150,
        sellingPrice: 250,
        quantityInStock: 100,
        unitType: UnitType.PIECE,
        lowStockThreshold: 20,
        taxable: true,
        branchId: branch.id,
      },
    }),
    
    // Product with variants
    prisma.product.create({
      data: {
        name: 'T-Shirt',
        sku: 'ACC-001',
        category: ProductCategory.ACCESSORIES,
        hasVariants: true,
        taxable: true,
        branchId: branch.id,
        variants: {
          create: [
            {
              name: 'Small - Black',
              sku: 'ACC-001-S-BLK',
              barcode: '1234567890001',
              costPrice: 1000,
              sellingPrice: 2000,
              quantityInStock: 50,
              lowStockThreshold: 10,
              attributes: JSON.stringify({ size: 'S', color: 'Black' }),
            },
            {
              name: 'Medium - Black',
              sku: 'ACC-001-M-BLK',
              barcode: '1234567890002',
              costPrice: 1000,
              sellingPrice: 2000,
              quantityInStock: 75,
              lowStockThreshold: 10,
              attributes: JSON.stringify({ size: 'M', color: 'Black' }),
            },
            {
              name: 'Large - White',
              sku: 'ACC-001-L-WHT',
              barcode: '1234567890003',
              costPrice: 1000,
              sellingPrice: 2000,
              quantityInStock: 60,
              lowStockThreshold: 10,
              attributes: JSON.stringify({ size: 'L', color: 'White' }),
            },
          ],
        },
      },
    }),
    
    // Frozen goods
    prisma.product.create({
      data: {
        name: 'Frozen Chicken',
        sku: 'FROZEN-001',
        barcode: '7890123456789',
        category: ProductCategory.FROZEN,
        hasVariants: false,
        costPrice: 1500,
        sellingPrice: 2500,
        quantityInStock: 45.5,
        unitType: UnitType.WEIGHT,
        lowStockThreshold: 10,
        taxable: true,
        branchId: branch.id,
      },
    }),
  ]);

  console.log(`✅ ${products.length} products created`);

  // Create Sample Expense
  await prisma.expense.create({
    data: {
      title: 'Electricity Bill',
      category: 'Utilities',
      amount: 25000,
      description: 'Monthly electricity payment',
      date: new Date(),
      branchId: branch.id,
    },
  });

  console.log('✅ Sample expense created');

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📝 Login Credentials:');
  console.log('   Admin - username: admin, password: admin123');
  console.log('   Cashier - username: cashier, password: cashier123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 5. API SPECIFICATIONS

### 5.1 API Structure & Standards

**Base URL**: `http://localhost:3000/api/v1`

**Response Format**:
```typescript
// Success Response
{
  "success": true,
  "data": any,
  "message": string (optional),
  "meta": {
    "page": number,
    "limit": number,
    "total": number
  } (for paginated responses)
}

// Error Response
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

### 5.2 Authentication Endpoints

#### POST /auth/login
**Description**: Authenticate user and return JWT token

**Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "username": "admin",
      "email": "admin@example.com",
      "firstName": "System",
      "lastName": "Administrator",
      "role": "ADMIN",
      "branchId": "uuid",
      "branch": {
        "id": "uuid",
        "name": "Main Branch"
      }
    }
  }
}
```

#### POST /auth/refresh
**Description**: Refresh access token

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /auth/logout
**Description**: Invalidate current session

**Headers**: `Authorization: Bearer {token}`

#### GET /auth/me
**Description**: Get current user information

**Headers**: `Authorization: Bearer {token}`

### 5.3 User Management Endpoints

#### GET /users
**Description**: List all users (Admin only)

**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `role`: ADMIN | CASHIER
- `isActive`: boolean
- `search`: string

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "username": "cashier",
      "email": "cashier@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CASHIER",
      "isActive": true,
      "branchId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

#### POST /users
**Description**: Create new user (Admin only)

**Request Body**:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "New",
  "lastName": "User",
  "role": "CASHIER",
  "branchId": "uuid"
}
```

#### GET /users/:id
**Description**: Get user by ID

#### PUT /users/:id
**Description**: Update user

#### DELETE /users/:id
**Description**: Delete user (soft delete - set isActive to false)

### 5.4 Product Management Endpoints

#### GET /products
**Description**: List all products

**Query Parameters**:
- `page`: number
- `limit`: number
- `category`: FROZEN | DRINKS | ACCESSORIES | OTHER
- `isActive`: boolean
- `hasVariants`: boolean
- `search`: string (searches name, sku, barcode)
- `lowStock`: boolean (filter products below threshold)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Coca Cola 500ml",
      "sku": "DRINK-001",
      "barcode": "5000112637588",
      "category": "DRINKS",
      "hasVariants": false,
      "costPrice": 150,
      "sellingPrice": 250,
      "quantityInStock": 100,
      "unitType": "PIECE",
      "lowStockThreshold": 20,
      "isActive": true,
      "variants": []
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50
  }
}
```

#### POST /products
**Description**: Create new product

**Request Body**:
```json
{
  "name": "Product Name",
  "description": "Description",
  "sku": "PROD-001",
  "barcode": "1234567890123",
  "category": "DRINKS",
  "hasVariants": false,
  "costPrice": 100,
  "sellingPrice": 200,
  "quantityInStock": 50,
  "unitType": "PIECE",
  "lowStockThreshold": 10,
  "taxable": true,
  "branchId": "uuid"
}
```

#### GET /products/:id
**Description**: Get product by ID (includes variants)

#### PUT /products/:id
**Description**: Update product

#### DELETE /products/:id
**Description**: Delete product (soft delete)

#### POST /products/:id/variants
**Description**: Add variant to product

**Request Body**:
```json
{
  "name": "Small - Red",
  "sku": "PROD-001-S-RED",
  "barcode": "1234567890124",
  "costPrice": 100,
  "sellingPrice": 200,
  "quantityInStock": 30,
  "lowStockThreshold": 5,
  "attributes": {
    "size": "S",
    "color": "Red"
  }
}
```

#### PUT /products/:id/variants/:variantId
**Description**: Update variant

#### DELETE /products/:id/variants/:variantId
**Description**: Delete variant

#### POST /products/generate-barcode
**Description**: Generate unique barcode for new product

**Response** (200):
```json
{
  "success": true,
  "data": {
    "barcode": "2987654321098",
    "format": "EAN-13"
  }
}
```

#### POST /products/search
**Description**: Advanced product search (for POS interface)

**Request Body**:
```json
{
  "query": "coca",
  "includeVariants": true,
  "limit": 10
}
```

### 5.5 Sales Endpoints

#### POST /sales
**Description**: Create new sale

**Request Body**:
```json
{
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid" (optional),
      "quantity": 2,
      "unitPrice": 250
    }
  ],
  "payments": [
    {
      "method": "CASH",
      "amount": 500
    }
  ],
  "customerName": "John Doe" (optional),
  "customerPhone": "+234..." (optional),
  "notes": "Special instructions" (optional)
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "receiptNumber": "RCP-20240101-0001",
    "subtotal": 500,
    "taxAmount": 37.5,
    "totalAmount": 537.5,
    "amountPaid": 537.5,
    "changeGiven": 0,
    "paymentStatus": "PAID",
    "items": [...],
    "payments": [...],
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### GET /sales
**Description**: List all sales

**Query Parameters**:
- `page`: number
- `limit`: number
- `startDate`: ISO date string
- `endDate`: ISO date string
- `cashierId`: uuid
- `paymentStatus`: PAID | PARTIAL | PENDING | CANCELLED
- `search`: string (receipt number or customer name)

#### GET /sales/:id
**Description**: Get sale by ID (with full details)

#### GET /sales/:id/receipt
**Description**: Get receipt data for printing

**Response** (200):
```json
{
  "success": true,
  "data": {
    "receipt": {
      "business": {
        "name": "Demo Retail Store",
        "address": "123 Main Street, Abuja",
        "phone": "+234-800-000-0000"
      },
      "branch": "Main Branch",
      "receiptNumber": "RCP-20240101-0001",
      "date": "2024-01-01T12:00:00.000Z",
      "cashier": "John Cashier",
      "items": [
        {
          "name": "Coca Cola 500ml",
          "quantity": 2,
          "unitPrice": 250,
          "total": 500
        }
      ],
      "subtotal": 500,
      "tax": 37.5,
      "total": 537.5,
      "payments": [
        {
          "method": "CASH",
          "amount": 537.5
        }
      ],
      "footer": "Thank you for your purchase!"
    }
  }
}
```

#### GET /sales/daily-summary
**Description**: Get today's sales summary for cashier

**Response** (200):
```json
{
  "success": true,
  "data": {
    "date": "2024-01-01",
    "totalSales": 15,
    "totalRevenue": 45000,
    "totalProfit": 12000,
    "paymentBreakdown": {
      "CASH": 30000,
      "CARD": 10000,
      "TRANSFER": 5000
    }
  }
}
```

### 5.6 Payment Endpoints

#### GET /payments
**Description**: List all payments

**Query Parameters**:
- `startDate`: ISO date string
- `endDate`: ISO date string
- `method`: CASH | CARD | TRANSFER
- `saleId`: uuid

### 5.7 Expense Endpoints

#### GET /expenses
**Description**: List all expenses

**Query Parameters**:
- `page`: number
- `limit`: number
- `startDate`: ISO date string
- `endDate`: ISO date string
- `category`: string
- `search`: string

#### POST /expenses
**Description**: Create new expense

**Request Body**:
```json
{
  "title": "Electricity Bill",
  "category": "Utilities",
  "amount": 25000,
  "description": "Monthly payment",
  "date": "2024-01-01",
  "branchId": "uuid"
}
```

#### GET /expenses/:id
#### PUT /expenses/:id
#### DELETE /expenses/:id

### 5.8 Inventory Endpoints

#### GET /inventory/logs
**Description**: Get inventory change history

**Query Parameters**:
- `productId`: uuid
- `variantId`: uuid
- `changeType`: RESTOCK | SALE | ADJUSTMENT | EXPIRY | DAMAGE | RETURN
- `startDate`: ISO date string
- `endDate`: ISO date string

#### POST /inventory/adjust
**Description**: Manual inventory adjustment

**Request Body**:
```json
{
  "productId": "uuid",
  "variantId": "uuid" (optional),
  "quantityChange": 10,
  "changeType": "RESTOCK",
  "reason": "New stock arrived",
  "notes": "Invoice #12345"
}
```

#### GET /inventory/low-stock
**Description**: Get products below threshold

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "productId": "uuid",
      "productName": "Coca Cola",
      "variantId": "uuid",
      "variantName": "500ml",
      "currentStock": 5,
      "threshold": 20,
      "deficit": 15
    }
  ]
}
```

#### GET /inventory/expiring
**Description**: Get products expiring soon

**Query Parameters**:
- `days`: number (default: 30)

### 5.9 Report Endpoints

#### GET /reports/sales
**Description**: Generate sales report

**Query Parameters**:
- `startDate`: ISO date string (required)
- `endDate`: ISO date string (required)
- `cashierId`: uuid
- `category`: product category
- `groupBy`: day | week | month

**Response** (200):
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "summary": {
      "totalSales": 450,
      "totalRevenue": 1250000,
      "totalProfit": 325000,
      "averageOrderValue": 2777.78
    },
    "breakdown": [
      {
        "date": "2024-01-01",
        "sales": 15,
        "revenue": 45000,
        "profit": 12000
      }
    ],
    "topProducts": [
      {
        "productName": "Coca Cola",
        "quantitySold": 250,
        "revenue": 62500
      }
    ],
    "categoryBreakdown": {
      "DRINKS": 500000,
      "FROZEN": 400000,
      "ACCESSORIES": 350000
    }
  }
}
```

#### GET /reports/profit-loss
**Description**: Generate profit & loss report

**Query Parameters**:
- `startDate`: ISO date string (required)
- `endDate`: ISO date string (required)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "revenue": {
      "sales": 1250000,
      "total": 1250000
    },
    "costs": {
      "costOfGoodsSold": 925000,
      "expenses": 125000,
      "total": 1050000
    },
    "profit": {
      "gross": 325000,
      "net": 200000,
      "margin": 16.0
    }
  }
}
```

#### GET /reports/inventory
**Description**: Generate inventory report

#### GET /reports/expenses
**Description**: Generate expense report

#### POST /reports/export
**Description**: Export report as PDF or Excel

**Request Body**:
```json
{
  "reportType": "sales" | "profit-loss" | "inventory" | "expenses",
  "format": "pdf" | "excel",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "filters": {}
}
```

**Response**: File download

### 5.10 Audit Log Endpoints

#### GET /audit-logs
**Description**: Get audit trail

**Query Parameters**:
- `page`: number
- `limit`: number
- `userId`: uuid
- `action`: AuditAction enum
- `entity`: string
- `startDate`: ISO date string
- `endDate`: ISO date string

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "username": "admin",
        "firstName": "System",
        "lastName": "Administrator"
      },
      "action": "UPDATE",
      "entity": "Product",
      "entityId": "uuid",
      "oldValues": {...},
      "newValues": {...},
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 250
  }
}
```

### 5.11 Backup Endpoints

#### POST /backup/create
**Description**: Create manual backup

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "backup-20240101-120000.db",
    "size": 10485760,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### GET /backup/list
**Description**: List all backups

#### POST /backup/restore/:id
**Description**: Restore from backup

#### DELETE /backup/:id
**Description**: Delete backup file

### 5.12 Settings Endpoints

#### GET /settings
**Description**: Get all system settings

#### PUT /settings
**Description**: Update system settings

**Request Body**:
```json
{
  "businessName": "My Store",
  "taxRate": 0.075,
  "receiptFooter": "Thank you!",
  "lowStockThreshold": 10
}
```

---

## 6. BUSINESS LOGIC

### 6.1 Product & Inventory Rules

1. **Product Creation**:
   - SKU must be unique across all products and variants
   - Barcode must be unique if provided
   - If `hasVariants` is true, product-level pricing is ignored
   - Generate barcode automatically if not provided

2. **Variant Management**:
   - Variants can only be added to products with `hasVariants: true`
   - Each variant must have unique SKU and barcode
   - Variants inherit tax settings from parent product
   - Deleting a product deletes all its variants (cascade)

3. **Stock Management**:
   - Stock is tracked at variant level if product has variants
   - Stock is tracked at product level for simple products
   - Stock cannot go negative (validate before sale)
   - Automatic stock deduction after successful sale
   - Manual adjustments logged in `InventoryLog`

4. **Low Stock Alerts**:
   - Alert triggered when `quantityInStock < lowStockThreshold`
   - Alerts shown on dashboard
   - Weekly email summary (future enhancement)

5. **Expiry Tracking**:
   - Only applicable to variants (e.g., frozen goods batches)
   - Show expiring products (within 30 days)
   - Mark as expired and adjust stock when date passes

### 6.2 Sales Process Flow

```
1. Cashier logs in
2. Search/scan products
3. Add items to cart
   ├─ Validate stock availability
   ├─ Calculate subtotal per item
   └─ Apply tax if taxable
4. Review cart
   ├─ Edit quantities
   └─ Remove items
5. Proceed to payment
   ├─ Calculate totals
   ├─ Accept payments (single or split)
   └─ Validate payment >= total
6. Complete sale
   ├─ Generate unique receipt number
   ├─ Deduct stock from inventory
   ├─ Create inventory logs
   ├─ Save sale record
   └─ Generate receipt
7. Print receipt (optional)
8. Display success message
```

### 6.3 Sales Calculations

```typescript
// Per Item
itemSubtotal = quantity * unitPrice
itemTaxAmount = taxable ? (itemSubtotal * taxRate) : 0
itemTotal = itemSubtotal + itemTaxAmount

// Sale Totals
saleSubtotal = sum(itemSubtotal for all items)
saleTaxAmount = sum(itemTaxAmount for all items)
saleTotalAmount = saleSubtotal + saleTaxAmount
saleAmountDue = saleTotalAmount - discountAmount

// Payment
amountPaid = sum(all payment amounts)
changeGiven = amountPaid - saleAmountDue (if amountPaid > saleAmountDue)
paymentStatus = {
  PAID: if amountPaid >= saleAmountDue
  PARTIAL: if 0 < amountPaid < saleAmountDue
  PENDING: if amountPaid === 0
}

// Profit Calculation (per item)
itemProfit = (unitPrice - costPrice) * quantity
```

### 6.4 Payment Rules

1. **Multiple Payment Methods**:
   - A sale can have multiple payment records
   - Each payment has a method (CASH, CARD, TRANSFER)
   - Sum of payments must equal or exceed total amount

2. **Change Calculation**:
   - Only applicable for CASH payments
   - `changeGiven = amountPaid - totalAmount` (if positive)

3. **Payment Validation**:
   - All payments must have positive amounts
   - Cannot complete sale if `amountPaid < totalAmount`

### 6.5 Receipt Generation Rules

1. **Receipt Number Format**:
   ```
   RCP-YYYYMMDD-XXXX
   Example: RCP-20240115-0001
   ```
   - Sequential numbering resets daily
   - Always 4 digits padded with zeros

2. **Receipt Content**:
   - Business name and branch info (from Branch table)
   - Receipt number and date/time
   - Cashier name
   - Itemized list (name, qty, price, subtotal)
   - Subtotal before tax
   - Tax amount (itemized if multiple rates)
   - Total amount
   - Payment breakdown by method
   - Change given (if applicable)
   - Footer message

3. **Receipt Formats**:
   - **Thermal**: 58mm or 80mm (configurable)
   - **PDF**: A4 or A5 size for digital storage
   - Both formats must contain identical information

### 6.6 Expense Management Rules

1. **Expense Recording**:
   - Only admins can create/edit/delete expenses
   - All expenses tied to specific branch
   - Expenses categorized (Utilities, Rent, Salaries, Supplies, etc.)
   - Date field for proper period allocation

2. **Expense Categories** (predefined):
   - Utilities
   - Rent
   - Salaries
   - Supplies
   - Maintenance
   - Marketing
   - Other

### 6.7 Profit & Loss Calculation

```typescript
// Revenue
totalSalesRevenue = sum(sale.totalAmount for all sales in period)

// Cost of Goods Sold (COGS)
totalCOGS = sum((saleItem.costPrice * saleItem.quantity) for all sale items in period)

// Gross Profit
grossProfit = totalSalesRevenue - totalCOGS
grossProfitMargin = (grossProfit / totalSalesRevenue) * 100

// Operating Expenses
totalExpenses = sum(expense.amount for all expenses in period)

// Net Profit
netProfit = grossProfit - totalExpenses
netProfitMargin = (netProfit / totalSalesRevenue) * 100
```

### 6.8 Audit Logging Rules

**Actions to Log**:
1. **Authentication**:
   - LOGIN (successful)
   - LOGIN_FAILED (failed attempts)
   - LOGOUT

2. **User Management**:
   - CREATE (new user)
   - UPDATE (user details changed)
   - DELETE (user deactivated)

3. **Product Management**:
   - CREATE (new product/variant)
   - UPDATE (price change, details updated)
   - DELETE (product deactivated)

4. **Inventory**:
   - All manual adjustments (RESTOCK, ADJUSTMENT, EXPIRY, DAMAGE)

5. **Sales**:
   - CREATE (new sale completed)

6. **System**:
   - BACKUP (manual backup created)
   - RESTORE (backup restored)
   - EXPORT (report exported)

**Audit Log Content**:
- User who performed action
- Timestamp
- Action type
- Entity affected
- Old values (JSON snapshot before change)
- New values (JSON snapshot after change)
- IP address (if available)

### 6.9 Backup Rules

1. **Automatic Backups**:
   - Run daily at 2:00 AM (configurable)
   - Keep last 30 days of backups
   - Auto-delete backups older than retention period
   - Store in `./backups/` directory

2. **Manual Backups**:
   - Admins can trigger anytime
   - Not subject to auto-deletion
   - Can be deleted manually

3. **Backup File Format**:
   ```
   backup-YYYYMMDD-HHMMSS-[auto|manual].db
   Example: backup-20240115-020000-auto.db
   ```

4. **Restore Process**:
   - Admin only
   - Creates backup of current database before restore
   - Requires confirmation
   - Logs restore action in audit log

---

## 7. FRONTEND IMPLEMENTATION

### 7.1 State Management Architecture

#### Global State (Zustand)

**Auth Store** (`store/authStore.js`):
```javascript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  login: (credentials) => Promise<void>,
  logout: () => void,
  refreshToken: () => Promise<void>
}
```

**Cart Store** (`store/cartStore.js`):
```javascript
{
  items: CartItem[],
  addItem: (product, variant?, quantity) => void,
  removeItem: (itemId) => void,
  updateQuantity: (itemId, quantity) => void,
  clearCart: () => void,
  getSubtotal: () => number,
  getTaxAmount: () => number,
  getTotal: () => number,
  getItemCount: () => number
}
```

**Theme Store** (`store/themeStore.js`):
```javascript
{
  isDarkMode: boolean,
  toggleTheme: () => void,
  setTheme: (theme: 'light' | 'dark') => void
}
```

**Settings Store** (`store/settingsStore.js`):
```javascript
{
  branchInfo: Branch | null,
  systemSettings: Settings,
  loadSettings: () => Promise<void>,
  updateSettings: (settings) => Promise<void>
}
```

#### Server State (React Query)

Configure React Query:
```javascript
// config/queryClient.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### 7.2 Routing Structure

```javascript
// router/index.jsx
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      // Admin Routes
      {
        path: 'dashboard',
        element: <RequireRole role="ADMIN"><Dashboard /></RequireRole>
      },
      {
        path: 'products',
        element: <RequireRole role="ADMIN"><Products /></RequireRole>
      },
      {
        path: 'products/:id',
        element: <RequireRole role="ADMIN"><ProductDetails /></RequireRole>
      },
      {
        path: 'inventory',
        element: <RequireRole role="ADMIN"><Inventory /></RequireRole>
      },
      {
        path: 'users',
        element: <RequireRole role="ADMIN"><Users /></RequireRole>
      },
      {
        path: 'expenses',
        element: <RequireRole role="ADMIN"><Expenses /></RequireRole>
      },
      {
        path: 'reports',
        element: <RequireRole role="ADMIN"><Reports /></RequireRole>
      },
      {
        path: 'audit-logs',
        element: <RequireRole role="ADMIN"><AuditLogs /></RequireRole>
      },
      {
        path: 'settings',
        element: <RequireRole role="ADMIN"><Settings /></RequireRole>
      },
      {
        path: 'backup',
        element: <RequireRole role="ADMIN"><Backup /></RequireRole>
      },
      
      // Cashier Routes
      {
        path: 'pos',
        element: <RequireRole role="CASHIER"><POS /></RequireRole>
      },
      {
        path: 'my-sales',
        element: <RequireRole role="CASHIER"><MySales /></RequireRole>
      },
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
]);
```

### 7.3 Key Component Specifications

#### Login Page
**Features**:
- Username/password fields
- Remember me checkbox
- Form validation
- Loading state during authentication
- Error message display
- Branch selector (if multiple branches)

**Validation Rules**:
- Username: required, min 3 characters
- Password: required, min 6 characters

#### Admin Dashboard
**Layout**: 4-column grid on desktop, 2-column on tablet, 1-column on mobile

**Widgets**:
1. **Sales Overview Card**:
   - Today's total sales count
   - Today's revenue
   - Comparison with yesterday (percentage change)
   
2. **Profit Card**:
   - Today's gross profit
   - Today's net profit
   - Profit margin percentage

3. **Inventory Status Card**:
   - Total products
   - Low stock items count (clickable)
   - Out of stock count

4. **Expenses Card**:
   - This month's total expenses
   - Top expense category

5. **Sales Chart** (full width):
   - Line chart showing last 7 days of sales
   - Toggle between revenue and profit

6. **Recent Sales Table**:
   - Last 10 transactions
   - Columns: Receipt #, Time, Cashier, Amount, Status
   - Click to view details

7. **Low Stock Alerts**:
   - Table of products below threshold
   - Columns: Product, Current Stock, Threshold, Action (Restock button)

8. **Top Selling Products**:
   - This week's top 5 products by quantity sold
   - Bar chart visualization

#### POS Interface (Cashier)

**Layout**: Split screen (70/30)

**Left Panel - Product Selection**:
1. **Search Bar**:
   - Search by name, SKU, or barcode
   - Auto-focus on load
   - Keyboard shortcut: Ctrl+F
   - Show suggestions as user types (debounced)

2. **Barcode Scanner Button**:
   - Opens camera/scanner interface
   - Beep sound on successful scan
   - Automatically adds to cart

3. **Category Filter Tabs**:
   - All, Frozen, Drinks, Accessories, Other
   - Show product count per category

4. **Product Grid**:
   - Responsive grid (4 columns desktop, 3 tablet, 2 mobile)
   - Each card shows:
     - Product image (placeholder if none)
     - Product name
     - Price
     - Stock status (badge)
     - Add to cart button
   - Click card to add to cart (or open variant selector)

**Right Panel - Cart & Checkout**:
1. **Cart Header**:
   - Item count badge
   - Clear cart button

2. **Cart Items List**:
   - Scrollable area
   - Each item shows:
     - Product/variant name
     - Quantity input (inline editable)
     - Unit price
     - Subtotal
     - Remove button
   - Empty state message

3. **Cart Summary**:
   - Subtotal
   - Tax (itemized by rate if multiple)
   - Total (large, bold)

4. **Action Buttons**:
   - Hold Sale (future feature)
   - Clear Cart
   - Proceed to Payment (primary, large)

**Payment Modal**:
1. **Amount Display**:
   - Total amount due (large)

2. **Payment Method Tabs**:
   - Cash, Card, Transfer
   - Can add multiple payments (split payment)

3. **Payment Form** (varies by method):
   - **Cash**: Amount tendered input, auto-calculate change
   - **Card**: Reference number input
   - **Transfer**: Reference number input

4. **Payment Summary**:
   - List of added payments
   - Remaining balance
   - Add Payment button

5. **Action Buttons**:
   - Cancel
   - Complete Sale (disabled until fully paid)

**Receipt Preview Modal**:
- Full receipt preview
- Print button
- Download PDF button
- Email button (future)
- New Sale button

#### Products Management Page

**Header**:
- Title
- Add Product button (primary)
- Export button (Excel/PDF)

**Filters Bar**:
- Search input
- Category dropdown
- Status dropdown (Active/Inactive/All)
- Has Variants filter
- Low Stock toggle

**Products Table**:
- Columns:
  - Image (thumbnail)
  - Name
  - SKU
  - Barcode
  - Category
  - Price (or "Variants" if has variants)
  - Stock (color-coded: green > threshold, yellow = threshold, red < threshold)
  - Status (badge)
  - Actions (Edit, View, Delete dropdown)
- Pagination
- Rows per page selector

**Product Form Modal**:
- Tabs: Basic Info, Pricing, Inventory, Variants (if applicable)
- **Basic Info Tab**:
  - Name (required)
  - Description (textarea)
  - SKU (required, auto-generate button)
  - Barcode (generate/scan buttons)
  - Category (dropdown)
  - Has Variants toggle
  - Image upload (future)
  
- **Pricing Tab** (hidden if has variants):
  - Cost Price
  - Selling Price
  - Profit margin (calculated, read-only)
  - Taxable toggle
  - Custom tax rate (optional)

- **Inventory Tab** (hidden if has variants):
  - Unit Type (dropdown)
  - Quantity in Stock
  - Low Stock Threshold
  - Expiry Date (for frozen goods)

- **Variants Tab** (shown if has variants):
  - Variants table
  - Add Variant button
  - Each variant row editable inline

**Product Details Page**:
- Product info summary
- Tabs: Details, Variants, Sales History, Inventory Logs
- Edit button
- Deactivate/Activate button

#### Inventory Management Page

**Overview Cards**:
- Total products
- Low stock items
- Out of stock items
- Expiring soon (within 30 days)

**Tabs**:
1. **All Products**: Full inventory with stock levels
2. **Low Stock**: Filtered view
3. **Expiring**: Products with upcoming expiry dates
4. **Inventory Logs**: History of all changes

**Bulk Actions**:
- Adjust Stock (select multiple, modal for adjustment)
- Export Inventory Report

**Adjust Stock Modal**:
- Product/variant selector
- Change type dropdown
- Quantity change input (positive or negative)
- Reason dropdown
- Notes textarea

#### Reports Page

**Report Selector**:
- Sales Report
- Profit & Loss Report
- Inventory Report
- Expense Report

**Date Range Picker**:
- Predefined ranges: Today, Yesterday, This Week, Last Week, This Month, Last Month, Custom Range
- Start date and end date inputs

**Additional Filters** (context-dependent):
- Cashier filter (for sales report)
- Category filter
- Product filter
- Expense category filter

**Report Display**:
- Summary cards at top
- Charts (line, bar, pie as appropriate)
- Detailed table below
- Export buttons (PDF, Excel)

**Sales Report Structure**:
```
Summary Cards:
- Total Sales
- Total Revenue  
- Total Profit
- Average Order Value

Charts:
- Revenue Trend (line chart over period)
- Sales by Category (pie chart)
- Sales by Cashier (bar chart)
- Sales by Day/Week (bar chart)

Tables:
- Detailed Transactions List
- Top Selling Products
- Payment Method Breakdown
```

**Profit & Loss Report Structure**:
```
Summary:
- Total Revenue
- Cost of Goods Sold
- Gross Profit
- Operating Expenses
- Net Profit
- Profit Margins

Breakdown Table:
| Category | Amount | % of Revenue |
|----------|--------|--------------|
| Revenue  | XXX    | 100%         |
| - COGS   | XXX    | XX%          |
| = Gross  | XXX    | XX%          |
| - Expenses| XXX   | XX%          |
| = Net    | XXX    | XX%          |
```

#### Users Management Page

**Users Table**:
- Columns: Avatar, Name, Username, Email, Role, Branch, Status, Last Login, Actions
- Filter by role and status
- Search by name/username

**User Form Modal**:
- Personal Info: First Name, Last Name, Email
- Credentials: Username, Password (hidden on edit)
- Role: Dropdown (Admin/Cashier)
- Branch: Dropdown
- Status: Active/Inactive toggle

#### Expenses Page

**Header**:
- Add Expense button
- Export button

**Filters**:
- Date range
- Category filter
- Search

**Expenses Table**:
- Columns: Date, Title, Category, Amount, Description, Actions
- Monthly subtotals
- Total at bottom

**Expense Form Modal**:
- Title (required)
- Category (dropdown with custom option)
- Amount (required)
- Date (date picker, default today)
- Description (textarea)

#### Audit Logs Page

**Filters**:
- Date range
- User filter
- Action type filter
- Entity type filter

**Audit Table**:
- Columns: Timestamp, User, Action, Entity, Details, View
- Click row to see full details modal

**Audit Details Modal**:
- All metadata
- Side-by-side comparison of old vs new values (if applicable)

#### Settings Page

**Tabs**:
1. **Branch Information**
2. **Tax Settings**
3. **Receipt Settings**
4. **System Settings**

**Branch Information Tab**:
- Branch name
- Location
- Contact details
- Business info for receipts

**Tax Settings Tab**:
- Default tax rate
- Tax label (e.g., "VAT", "Sales Tax")
- Tax-inclusive pricing toggle

**Receipt Settings Tab**:
- Business name
- Business address
- Business phone
- Receipt footer message
- Receipt paper size (58mm/80mm)

**System Settings Tab**:
- Default low stock threshold
- Backup settings (interval, retention)
- Date format preference
- Currency format

#### Backup Page

**Automatic Backup Settings**:
- Enable/disable toggle
- Schedule (time of day)
- Retention period (days)

**Manual Backup Section**:
- Create Backup Now button
- Last backup timestamp

**Backup History Table**:
- Columns: Timestamp, Filename, Size, Type (Auto/Manual), Actions
- Actions: Download, Restore, Delete
- Sort by date (newest first)

**Restore Confirmation Modal**:
- Warning message
- Checkbox: "I understand this will overwrite current data"
- Backup current database checkbox
- Cancel and Confirm buttons

### 7.4 Utility Functions

#### Formatters (`utils/formatters.js`)

```javascript
// Currency formatting
export const formatCurrency = (amount, currency = 'NGN') => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Date formatting
export const formatDate = (date, format = 'medium') => {
  const options = {
    short: { year: '2-digit', month: 'numeric', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
  };
  return new Intl.DateTimeFormat('en-US', options[format]).format(new Date(date));
};

// Number formatting
export const formatNumber = (number, decimals = 0) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

// Percentage formatting
export const formatPercentage = (value, decimals = 1) => {
  return `${formatNumber(value, decimals)}%`;
};

// Receipt number formatting
export const generateReceiptNumber = (date = new Date(), sequence) => {
  const dateStr = format(date, 'yyyyMMdd');
  const seqStr = String(sequence).padStart(4, '0');
  return `RCP-${dateStr}-${seqStr}`;
};
```

#### Validators (`utils/validators.js`)

```javascript
// Product validation
export const validateProduct = (data) => {
  const errors = {};
  
  if (!data.name?.trim()) errors.name = 'Product name is required';
  if (!data.sku?.trim()) errors.sku = 'SKU is required';
  if (!data.category) errors.category = 'Category is required';
  
  if (!data.hasVariants) {
    if (data.costPrice == null || data.costPrice < 0) {
      errors.costPrice = 'Cost price must be a positive number';
    }
    if (data.sellingPrice == null || data.sellingPrice < 0) {
      errors.sellingPrice = 'Selling price must be a positive number';
    }
    if (data.sellingPrice < data.costPrice) {
      errors.sellingPrice = 'Selling price cannot be less than cost price';
    }
    if (data.quantityInStock < 0) {
      errors.quantityInStock = 'Stock cannot be negative';
    }
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};

// Sale validation
export const validateSale = (cart, payments) => {
  const errors = {};
  
  if (cart.items.length === 0) {
    errors.cart = 'Cart cannot be empty';
  }
  
  // Check stock availability
  for (const item of cart.items) {
    if (item.quantity > item.availableStock) {
      errors[`item_${item.id}`] = `Only ${item.availableStock} units available`;
    }
  }
  
  const totalAmount = cart.total;
  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  
  if (paidAmount < totalAmount) {
    errors.payment = `Insufficient payment. Need ${formatCurrency(totalAmount - paidAmount)} more`;
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};
```

#### Helpers (`utils/helpers.js`)

```javascript
// Calculate tax
export const calculateTax = (amount, taxRate) => {
  return amount * taxRate;
};

// Calculate profit
export const calculateProfit = (sellingPrice, costPrice, quantity) => {
  return (sellingPrice - costPrice) * quantity;
};

// Calculate profit margin
export const calculateProfitMargin = (sellingPrice, costPrice) => {
  if (costPrice === 0) return 0;
  return ((sellingPrice - costPrice) / sellingPrice) * 100;
};

// Generate barcode
export const generateBarcode = () => {
  // EAN-13 format: 12 digits + 1 check digit
  const prefix = '200'; // Internal use prefix
  const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  const code = prefix + random;
  
  // Calculate check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return code + checkDigit;
};

// Group data by period
export const groupByPeriod = (data, dateField, period = 'day') => {
  const grouped = {};
  
  data.forEach(item => {
    const date = new Date(item[dateField]);
    let key;
    
    switch (period) {
      case 'day':
        key = format(date, 'yyyy-MM-dd');
        break;
      case 'week':
        key = `Week ${format(date, 'w, yyyy')}`;
        break;
      case 'month':
        key = format(date, 'MMMM yyyy');
        break;
      default:
        key = format(date, 'yyyy-MM-dd');
    }
    
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });
  
  return grouped;
};

// Export to CSV
export const exportToCSV = (data, filename) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const value = row[h];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    }).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
```

### 7.5 Print Service

```javascript
// services/print.service.js

export const printReceipt = async (receiptData) => {
  // Generate HTML receipt
  const html = generateReceiptHTML(receiptData);
  
  // For thermal printers (if available)
  if (window.electronAPI?.print) {
    await window.electronAPI.print(html, {
      silent: false,
      printer: localStorage.getItem('defaultPrinter'),
      width: 80, // 80mm
    });
  } else {
    // Fallback to browser print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
};

export const generateReceiptHTML = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          max-width: 300px;
          margin: 0 auto;
          padding: 10px;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .large { font-size: 14px; }
        .divider {
          border-top: 1px dashed #000;
          margin: 10px 0;
        }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; }
        .right { text-align: right; }
        .item-row td:first-child { width: 60%; }
        .item-row td:last-child { text-align: right; }
        @media print {
          body { margin: 0; padding: 5mm; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="center bold large">${data.business.name}</div>
      <div class="center">${data.business.address}</div>
      <div class="center">${data.business.phone}</div>
      <div class="center">${data.branch}</div>
      
      <div class="divider"></div>
      
      <table>
        <tr>
          <td>Receipt #:</td>
          <td class="right bold">${data.receiptNumber}</td>
        </tr>
        <tr>
          <td>Date:</td>
          <td class="right">${formatDate(data.date, 'datetime')}</td>
        </tr>
        <tr>
          <td>Cashier:</td>
          <td class="right">${data.cashier}</td>
        </tr>
      </table>
      
      <div class="divider"></div>
      
      <table>
        ${data.items.map(item => `
          <tr class="item-row">
            <td colspan="2">${item.name}</td>
          </tr>
          <tr class="item-row">
            <td>${item.quantity} x ${formatCurrency(item.unitPrice)}</td>
            <td class="right">${formatCurrency(item.total)}</td>
          </tr>
        `).join('')}
      </table>
      
      <div class="divider"></div>
      
      <table>
        <tr>
          <td>Subtotal:</td>
          <td class="right">${formatCurrency(data.subtotal)}</td>
        </tr>
        <tr>
          <td>Tax (${(data.taxRate * 100).toFixed(1)}%):</td>
          <td class="right">${formatCurrency(data.tax)}</td>
        </tr>
        <tr class="bold large">
          <td>TOTAL:</td>
          <td class="right">${formatCurrency(data.total)}</td>
        </tr>
      </table>
      
      <div class="divider"></div>
      
      <table>
        ${data.payments.map(p => `
          <tr>
            <td>${p.method}:</td>
            <td class="right">${formatCurrency(p.amount)}</td>
          </tr>
        `).join('')}
        ${data.change > 0 ? `
          <tr>
            <td>Change:</td>
            <td class="right">${formatCurrency(data.change)}</td>
          </tr>
        ` : ''}
      </table>
      
      <div class="divider"></div>
      
      <div class="center">${data.footer}</div>
      
      <br>
      <button class="no-print" onclick="window.print()">Print</button>
    </body>
    </html>
  `;
};

export const generateReceiptPDF = async (receiptData) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ format: 'a5' });
  
  // Add content to PDF
  let y = 20;
  
  doc.setFontSize(16);
  doc.text(receiptData.business.name, 105, y, { align: 'center' });
  
  y += 10;
  doc.setFontSize(10);
  doc.text(receiptData.business.address, 105, y, { align: 'center' });
  
  // ... continue formatting
  
  // Save or return blob
  return doc.output('blob');
};
```

---

## 8. SECURITY & AUDIT

### 8.1 Authentication Implementation

#### Backend JWT Strategy

```typescript
// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; username: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { branch: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    delete user.passwordHash;
    return user;
  }
}
```

#### Frontend Auth Interceptor

```javascript
// services/api.js
import axios from 'axios';
import { authStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = authStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expired - try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await authStore.getState().refreshToken();
        const newToken = authStore.getState().token;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        authStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;d     String
  branch       Branch   @relation(fields: [branchId], references: [id])
  
  // Relations
  sales        Sale[]
  auditLogs    AuditLog[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@index([username])
  @@index([branchId])
  @@map("users")
}

enum UserRole {
  ADMIN
  CASHIER
}

// ============================================
// BRANCH MANAGEMENT
// ============================================

model Branch {
  id          String   @id @default(uuid())
  name        String
  location    String?
  phone       String?
  email       String?
  address     String?
  taxRate     Float    @default(0.075) // 7.5% VAT
  currency    String   @default("NGN")
  
  // Business Info for Receipts
  businessName    String?
  businessAddress String?
  businessPhone   String?
  receiptFooter   String?
  
  // Relations
  users       User[]
  products    Product[]
  sales       Sale[]
  expenses    Expense[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("branches")
}

// ============================================
// PRODUCT & INVENTORY MANAGEMENT
// ============================================

model Product {
  id                String        @id @default(uuid())
  name              String
  description       String?
  sku               String        @unique
  barcode           String?       @unique
  category          ProductCategory
  hasVariants       Boolean       @default(false)
  
  // Pricing (for products without variants)
  costPrice         Float?
  sellingPrice      Float?
  
  // Inventory (for products without variants)
  quantityInStock   Float?
  unitType          UnitType      @default(PIECE)
  lowStockThreshold Float?
  
  // Tax
  taxable           Boolean       @default(true)
  taxRate           Float?
  
  // Tracking
  trackInventory    Boolean       @default(true)
  isActive          Boolean       @default(true)
  
  branchId          String
  branch            Branch        @relation(fields: [branchId], references: [id])
  
  // Relations
  variants          ProductVariant[]
  saleItems         SaleItem[]
  inventoryLogs     InventoryLog[]
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  @@index([sku])
  @@index([barcode])
  @@index([category])
  @@index([branchId])
  @@map("products")
}

model ProductVariant {
  id                String   @id @default(uuid())
  productId         String
  product           Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  name              String   // e.g., "Small", "500g", "Red"
  sku               String   @unique
  barcode           String?  @unique
  
  // Pricing
  costPrice         Float
  sellingPrice      Float
  
  // Inventory
  quantityInStock   Float    @default(0)
  lowStockThreshold Float    @default(10)
  
  // Attributes (JSON for flexibility)
  attributes        String?  // JSON: {"size": "small", "color": "red"}
  
  isActive          Boolean  @default(true)
  expiryDate        DateTime?
  
  // Relations
  saleItems         SaleItem[]
  inventoryLogs     InventoryLog[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([sku])
  @@index([barcode])
  @@index([productId])
  @@map("product_variants")
}

enum ProductCategory {
  FROZEN
  DRINKS
  ACCESSORIES
  OTHER
}

enum UnitType {
  PIECE
  WEIGHT
  VOLUME
}

// ============================================
// SALES & TRANSACTIONS
// ============================================

model Sale {
  id              String        @id @default(uuid())
  receiptNumber   String        @unique
  
  cashierId       String
  cashier         User          @relation(fields: [cashierId], references: [id])
  
  branchId        String
  branch          Branch        @relation(fields: [branchId], references: [id])
  
  // Amounts
  subtotal        Float
  taxAmount       Float
  discountAmount  Float         @default(0)
  totalAmount     Float
  
  // Payment
  paymentStatus   PaymentStatus @default(PENDING)
  amountPaid      Float         @default(0)
  amountDue       Float
  changeGiven     Float         @default(0)
  
  // Additional Info
  notes           String?
  customerName    String?
  customerPhone   String?
  
  // Relations
  items           SaleItem[]
  payments        Payment[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@index([receiptNumber])
  @@index([cashierId])
  @@index([branchId])
  @@index([createdAt])
  @@index([paymentStatus])
  @@map("sales")
}

model SaleItem {
  id              String          @id @default(uuid())
  saleId          String
  sale            Sale            @relation(fields: [saleId], references: [id], onDelete: Cascade)
  
  productId       String
  product         Product         @relation(fields: [productId], references: [id])
  
  variantId       String?
  variant         ProductVariant? @relation(fields: [variantId], references: [id])
  
  // Item Details (snapshot at time of sale)
  itemName        String
  itemSku         String
  
  quantity        Float
  unitPrice       Float
  costPrice       Float          // For profit calculation
  taxRate         Float
  taxAmount       Float
  subtotal        Float          // quantity * unitPrice
  total           Float          // subtotal + taxAmount
  
  createdAt       DateTime       @default(now())
  
  @@index([saleId])
  @@index([productId])
  @@map("sale_items")
}

enum PaymentStatus {
  PENDING
  PARTIAL
  PAID
  CANCELLED
}

// ============================================
// PAYMENTS
// ============================================

model Payment {
  id              String        @id @default(uuid())
  saleId          String
  sale            Sale          @relation(fields: [saleId], references: [id], onDelete: Cascade)
  
  method          PaymentMethod
  amount          Float
  reference       String?       // For card/transfer transactions
  notes           String?
  
  createdAt       DateTime      @default(now())
  
  @@index([saleId])
  @@index([method])
  @@map("payments")
}

enum PaymentMethod {
  CASH
  CARD
  TRANSFER
}

// ============================================
// EXPENSES
// ============================================

model Expense {
  id          String   @id @default(uuid())
  title       String
  category    String
  amount      Float
  description String?
  date        DateTime
  
  branchI
