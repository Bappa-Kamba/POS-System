import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductCategory, UnitType, AuditAction } from '@prisma/client';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: jest.Mocked<PrismaService>;

  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    sku: 'TEST-001',
    barcode: '1234567890123',
    category: ProductCategory.DRINKS,
    hasVariants: false,
    costPrice: 100,
    sellingPrice: 200,
    quantityInStock: 50,
    unitType: UnitType.PIECE,
    lowStockThreshold: 10,
    taxable: true,
    isActive: true,
    branchId: 'branch-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    description: null,
    taxRate: null,
    trackInventory: true,
    branch: {
      id: 'branch-1',
      name: 'Main Branch',
    },
  };

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      name: 'Test Product',
      sku: 'TEST-001',
      category: ProductCategory.DRINKS,
      hasVariants: false,
      costPrice: 100,
      sellingPrice: 200,
      quantityInStock: 50,
      branchId: 'branch-1',
    };

    it('should create a product successfully', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      prisma.product.create.mockResolvedValue(mockProduct);
      prisma.auditLog.create.mockResolvedValue({} as any);

      const result = await service.create(createDto, 'user-1');

      expect(result).toEqual(mockProduct);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          isActive: true,
        },
        include: {
          branch: {
            select: { id: true, name: true },
          },
        },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate SKU', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.create(createDto, 'user-1')).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.product.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate barcode', async () => {
      prisma.product.findUnique
        .mockResolvedValueOnce(null) // SKU check
        .mockResolvedValueOnce(mockProduct); // Barcode check

      await expect(
        service.create({ ...createDto, barcode: '1234567890123' }, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when product without variants has no prices', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          { ...createDto, costPrice: undefined, sellingPrice: undefined },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when selling price is less than cost price', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ ...createDto, sellingPrice: 50 }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('product-1');

      expect(result).toEqual(mockProduct);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        include: {
          variants: {
            where: { isActive: true },
            orderBy: { name: 'asc' },
          },
          branch: true,
        },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const updateDto = { name: 'Updated Product' };
      const updatedProduct = { ...mockProduct, ...updateDto };

      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.product.update.mockResolvedValue(updatedProduct);
      prisma.auditLog.create.mockResolvedValue({} as any);

      const result = await service.update('product-1', updateDto, 'user-1');

      expect(result).toEqual(updatedProduct);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: updateDto,
        include: {
          branch: {
            select: { id: true, name: true },
          },
        },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when product not found', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { name: 'Test' }, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a product', async () => {
      const deletedProduct = { ...mockProduct, isActive: false };

      prisma.product.findUnique.mockResolvedValue(mockProduct);
      prisma.product.update.mockResolvedValue(deletedProduct);
      prisma.auditLog.create.mockResolvedValue({} as any);

      const result = await service.remove('product-1', 'user-1');

      expect(result.isActive).toBe(false);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: { isActive: false },
        include: {
          branch: {
            select: { id: true, name: true },
          },
        },
      });
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: AuditAction.DELETE,
          entity: 'Product',
          entityId: 'product-1',
        }),
      });
    });
  });
});

