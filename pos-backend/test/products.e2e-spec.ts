import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let branchId: string;

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

    // Ensure admin user exists
    let user = await prisma.user.findUnique({
      where: { username: 'admin' },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      user = await prisma.user.create({
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

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    authToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    // Clean up test products
    await prisma.product.deleteMany({
      where: { sku: { startsWith: 'TEST-' } },
    });
    await prisma.$disconnect();
    await app.close();
  });

  describe('/products (POST)', () => {
    it('should create a product', async () => {
      const response = await request(app.getHttpServer())
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
          branchId,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test Product');
      expect(response.body.data.sku).toBe('TEST-001');
    });

    it('should reject unauthorized access', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Test Product',
          sku: 'TEST-002',
          category: 'DRINKS',
          hasVariants: false,
          branchId,
        })
        .expect(401);
    });

    it('should reject duplicate SKU', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Duplicate Product',
          sku: 'TEST-001', // Same SKU as above
          category: 'DRINKS',
          hasVariants: false,
          costPrice: 100,
          sellingPrice: 200,
          branchId,
        })
        .expect(409);
    });
  });

  describe('/products (GET)', () => {
    it('should return paginated products', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
    });

    it('should filter products by search', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Test' })
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].name).toContain('Test');
      }
    });
  });

  describe('/products/:id (GET)', () => {
    let productId: string;

    beforeAll(async () => {
      const product = await prisma.product.findFirst({
        where: { sku: 'TEST-001' },
      });
      productId = product?.id || '';
    });

    it('should return a product by id', async () => {
      if (!productId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(productId);
    });

    it('should return 404 for non-existent product', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
