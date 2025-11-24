import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should login successfully with valid credentials', async () => {
      // Find or create test user
      let user = await prisma.user.findUnique({
        where: { username: 'admin' },
      });

      if (!user) {
        const branch = await prisma.branch.findFirst();
        if (!branch) {
          throw new Error('No branch found. Please seed the database.');
        }

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

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.username).toBe('admin');
    });

    it('should reject login with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject login with missing username', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          password: 'admin123',
        })
        .expect(400);
    });

    it('should reject login with missing password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: 'admin',
        })
        .expect(400);
    });
  });

  describe('/auth/refresh (POST)', () => {
    let refreshToken: string;

    beforeAll(async () => {
      // Login to get refresh token
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        });

      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });
  });
});

