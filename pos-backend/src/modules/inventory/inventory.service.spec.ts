import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryChangeType, ProductCategory, UnitType } from '@prisma/client';

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: jest.Mocked<PrismaService>;

  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    sku: 'TEST-001',
    hasVariants: false,
    quantityInStock: 50,
    lowStockThreshold: 10,
    branchId: 'branch-1',
    category: ProductCategory.DRINKS,
    unitType: UnitType.PIECE,
  };

  const mockVariant = {
    id: 'variant-1',
    productId: 'product-1',
    name: 'Small',
    sku: 'TEST-001-S',
    quantityInStock: 30,
    lowStockThreshold: 5,
    isActive: true,
  };

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    productVariant: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    inventoryLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('adjustStock', () => {
    const adjustDto = {
      productId: 'product-1',
      quantityChange: 10,
      changeType: InventoryChangeType.RESTOCK,
      reason: 'New stock arrived',
    };

    it('should adjust stock for product without variants', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.product.update.mockResolvedValue({
        ...mockProduct,
        quantityInStock: 60,
      });
      prisma.inventoryLog.create.mockResolvedValue({
        id: 'log-1',
        productId: 'product-1',
        changeType: InventoryChangeType.RESTOCK,
        quantityChange: 10,
        previousQuantity: 50,
        newQuantity: 60,
        createdAt: new Date(),
      } as any);
      prisma.auditLog = {
        create: jest.fn().mockResolvedValue({}),
      } as any;

      const result = await service.adjustStock(adjustDto, 'user-1', 'branch-1');

      expect(result).toBeDefined();
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: { quantityInStock: 60 },
      });
      expect(prisma.inventoryLog.create).toHaveBeenCalled();
    });

    it('should adjust stock for variant', async () => {
      const variantDto = {
        ...adjustDto,
        variantId: 'variant-1',
      };

      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.productVariant.findUnique.mockResolvedValue(mockVariant);
      prisma.productVariant.update.mockResolvedValue({
        ...mockVariant,
        quantityInStock: 40,
      });
      prisma.inventoryLog.create.mockResolvedValue({
        id: 'log-1',
        productId: 'product-1',
        variantId: 'variant-1',
        changeType: InventoryChangeType.RESTOCK,
        quantityChange: 10,
        previousQuantity: 30,
        newQuantity: 40,
        createdAt: new Date(),
      } as any);
      prisma.auditLog = {
        create: jest.fn().mockResolvedValue({}),
      } as any;

      const result = await service.adjustStock(variantDto, 'user-1', 'branch-1');

      expect(result).toBeDefined();
      expect(prisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: 'variant-1' },
        data: { quantityInStock: 40 },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.adjustStock(adjustDto, 'user-1', 'branch-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when resulting quantity is negative', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      await expect(
        service.adjustStock(
          { ...adjustDto, quantityChange: -100 },
          'user-1',
          'branch-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when variant not found', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.productVariant.findUnique.mockResolvedValue(null);

      await expect(
        service.adjustStock(
          { ...adjustDto, variantId: 'non-existent' },
          'user-1',
          'branch-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllLogs', () => {
    it('should return paginated inventory logs', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          productId: 'product-1',
          changeType: InventoryChangeType.RESTOCK,
          quantityChange: 10,
          previousQuantity: 50,
          newQuantity: 60,
          createdAt: new Date(),
        },
      ];

      prisma.inventoryLog.findMany = jest.fn().mockResolvedValue(mockLogs);
      prisma.inventoryLog.count = jest.fn().mockResolvedValue(1);

      const result = await service.findAllLogs({
        page: 1,
        limit: 20,
        productId: 'product-1',
      });

      expect(result.data).toEqual(mockLogs);
      expect(result.meta.total).toBe(1);
    });
  });
});

