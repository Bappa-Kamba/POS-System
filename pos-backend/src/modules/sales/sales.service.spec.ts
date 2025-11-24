import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SalesService } from './sales.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, PaymentMethod, ProductCategory, UnitType } from '@prisma/client';

describe('SalesService', () => {
  let service: SalesService;
  let prisma: jest.Mocked<PrismaService>;

  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    sku: 'TEST-001',
    hasVariants: false,
    costPrice: 100,
    sellingPrice: 200,
    quantityInStock: 50,
    taxable: true,
    taxRate: 0.075,
    branchId: 'branch-1',
    category: ProductCategory.DRINKS,
    unitType: UnitType.PIECE,
  };

  const mockBranch = {
    id: 'branch-1',
    name: 'Main Branch',
    taxRate: 0.075,
  };

  const mockPrismaService = {
    sale: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    productVariant: {
      findUnique: jest.fn(),
    },
    saleItem: {
      createMany: jest.fn(),
    },
    payment: {
      createMany: jest.fn(),
    },
    inventoryLog: {
      create: jest.fn(),
    },
    branch: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateReceiptNumber', () => {
    it('should generate receipt number with correct format', async () => {
      const testDate = new Date('2024-01-15T10:00:00Z');
      prisma.sale.count.mockResolvedValue(0);

      const result = await service.generateReceiptNumber(testDate);

      expect(result).toMatch(/^RCP-20240115-\d{4}$/);
      expect(result).toBe('RCP-20240115-0001');
    });

    it('should increment sequence for same day', async () => {
      const testDate = new Date('2024-01-15T10:00:00Z');
      prisma.sale.count.mockResolvedValue(5);

      const result = await service.generateReceiptNumber(testDate);

      expect(result).toBe('RCP-20240115-0006');
    });
  });

  describe('create', () => {
    const createDto = {
      items: [
        {
          productId: 'product-1',
          quantity: 2,
          unitPrice: 200,
        },
      ],
      payments: [
        {
          method: PaymentMethod.CASH,
          amount: 430,
        },
      ],
    };

    it('should throw BadRequestException when items are empty', async () => {
      await expect(
        service.create({ items: [], payments: [] }, 'cashier-1', 'branch-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when payments are empty', async () => {
      await expect(
        service.create(
          { items: createDto.items, payments: [] },
          'cashier-1',
          'branch-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a sale successfully', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.branch.findUnique.mockResolvedValue(mockBranch);
      prisma.sale.count.mockResolvedValue(0);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(prisma);
      });

      const mockSale = {
        id: 'sale-1',
        receiptNumber: 'RCP-20240115-0001',
        subtotal: 400,
        taxAmount: 30,
        totalAmount: 430,
        paymentStatus: PaymentStatus.PAID,
        amountPaid: 430,
        amountDue: 0,
        changeGiven: 0,
        cashierId: 'cashier-1',
        branchId: 'branch-1',
        discountAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: null,
        customerName: null,
        customerPhone: null,
      };

      prisma.sale.create.mockResolvedValue(mockSale);

      const result = await service.create(createDto, 'cashier-1', 'branch-1');

      expect(result).toBeDefined();
      expect(result.receiptNumber).toMatch(/^RCP-/);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      prisma.$transaction.mockImplementation(async (callback) => {
        return callback(prisma);
      });

      await expect(
        service.create(createDto, 'cashier-1', 'branch-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      const productWithLowStock = { ...mockProduct, quantityInStock: 1, isActive: true };
      prisma.branch.findUnique.mockResolvedValue(mockBranch);
      prisma.sale.count.mockResolvedValue(0);
      
      // Mock product lookup - first call (before transaction) and inside transaction
      const productFindUniqueMock = jest.fn().mockResolvedValue(productWithLowStock);
      prisma.product.findUnique = productFindUniqueMock;
      
      prisma.$transaction.mockImplementation(async (callback) => {
        // Inside transaction, product should also be found
        const transactionPrisma = {
          ...prisma,
          product: {
            ...prisma.product,
            findUnique: productFindUniqueMock,
            update: jest.fn().mockResolvedValue(productWithLowStock),
          },
        };
        return callback(transactionPrisma);
      });

      await expect(
        service.create(createDto, 'cashier-1', 'branch-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated sales', async () => {
      const mockSales = [
        {
          id: 'sale-1',
          receiptNumber: 'RCP-20240115-0001',
          totalAmount: 430,
          paymentStatus: PaymentStatus.PAID,
          createdAt: new Date(),
        },
      ];

      prisma.sale.findMany.mockResolvedValue(mockSales as any);
      prisma.sale.count.mockResolvedValue(1);

      const result = await service.findAll({
        page: 1,
        limit: 20,
        branchId: 'branch-1',
      });

      expect(result.data).toEqual(mockSales);
      expect(result.meta.total).toBe(1);
      expect(prisma.sale.findMany).toHaveBeenCalled();
    });
  });
});

