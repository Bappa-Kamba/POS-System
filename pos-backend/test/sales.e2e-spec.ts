import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PaymentMethod, ProductCategory, UnitType } from '@prisma/client';

describe('Sales (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let cashierToken: string;
  let branchId: string;
  let productId: string;
  let cashierId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Ensure branch exists
    let branch = await prisma.branch.findFirst();
    if (!branch) {
      branch = await prisma.branch.create({
        data: {
          name: 'Test Branch',
          location: 'Test Location',
          taxRate: 0.075,
          currency: 'NGN',
        },
      });
    }
    branchId = branch.id;

    // Create admin user
    let admin = await prisma.user.findUnique({
      where: { username: 'admin' },
    });

    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@test.com',
          passwordHash: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          branchId: branch.id,
        },
      });
    }

    // Create cashier user
    let cashier = await prisma.user.findUnique({
      where: { username: 'cashier' },
    });

    if (!cashier) {
      const hashedPassword = await bcrypt.hash('cashier123', 10);
      cashier = await prisma.user.create({
        data: {
          username: 'cashier',
          email: 'cashier@test.com',
          passwordHash: hashedPassword,
          firstName: 'Cashier',
          lastName: 'User',
          role: 'CASHIER',
          branchId: branch.id,
        },
      });
    }
    cashierId = cashier.id;

    // Create test product
    let product = await prisma.product.findFirst({
      where: { sku: 'TEST-SALE-001' },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          name: 'Test Sale Product',
          sku: 'TEST-SALE-001',
          category: ProductCategory.DRINKS,
          hasVariants: false,
          costPrice: 100,
          sellingPrice: 200,
          quantityInStock: 100,
          unitType: UnitType.PIECE,
          lowStockThreshold: 10,
          taxable: true,
          branchId: branch.id,
        },
      });
    }
    productId = product.id;

    // Login as admin
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    authToken = adminLogin.body.data.accessToken;

    // Login as cashier
    const cashierLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'cashier', password: 'cashier123' });
    cashierToken = cashierLogin.body.data.accessToken;
  });

  afterAll(async () => {
    // Clean up test sales
    await prisma.sale.deleteMany({
      where: { receiptNumber: { startsWith: 'RCP-' } },
    });
    await prisma.$disconnect();
    await app.close();
  });

  describe('/sales (POST)', () => {
    it('should create a sale successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/sales')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          items: [
            {
              productId,
              quantity: 2,
              unitPrice: 200,
            },
          ],
          payments: [
            {
              method: PaymentMethod.CASH,
              amount: 430, // 400 + 30 tax
            },
          ],
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('receiptNumber');
      expect(response.body.data.receiptNumber).toMatch(/^RCP-/);
      expect(response.body.data.totalAmount).toBe(430);
      expect(response.body.data.paymentStatus).toBe('PAID');
    });

    it('should reject sale with empty items', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/sales')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          items: [],
          payments: [{ method: PaymentMethod.CASH, amount: 100 }],
        })
        .expect(400);
    });

    it('should reject sale with insufficient payment', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/sales')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          items: [
            {
              productId,
              quantity: 2,
              unitPrice: 200,
            },
          ],
          payments: [
            {
              method: PaymentMethod.CASH,
              amount: 100, // Less than total
            },
          ],
        })
        .expect(400);
    });

    it('should reject unauthorized access', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/sales')
        .send({
          items: [{ productId, quantity: 1, unitPrice: 200 }],
          payments: [{ method: PaymentMethod.CASH, amount: 200 }],
        })
        .expect(401);
    });
  });

  describe('/sales (GET)', () => {
    it('should return paginated sales', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty('total');
    });
  });
});
