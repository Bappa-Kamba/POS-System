import {
  PrismaClient,
  UserRole,
  ProductCategory,
  UnitType,
  ProductSubdivision,
  SubdivisionStatus,
} from '@prisma/client';
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

  // Create Subdivisions
  const cashbackSubdivision = await prisma.subdivision.create({
    data: {
      name: ProductSubdivision.CASHBACK_ACCESSORIES,
      displayName: 'Cashback & Accessories',
      description: 'Mobile accessories, phone cases, chargers, and cashback services',
      status: SubdivisionStatus.ACTIVE,
      color: '#3B82F6', // Blue
      icon: 'Smartphone',
    },
  });

  const frozenDrinksSubdivision = await prisma.subdivision.create({
    data: {
      name: ProductSubdivision.FROZEN_DRINKS,
      displayName: 'Frozen Products & Drinks',
      description: 'Frozen foods, beverages, ice cream, and cold drinks',
      status: SubdivisionStatus.ACTIVE,
      color: '#10B981', // Green
      icon: 'Snowflake',
    },
  });

  console.log('✅ Subdivisions created');

  // Assign Subdivisions to Branch
  await prisma.branchSubdivision.createMany({
    data: [
      {
        branchId: branch.id,
        subdivisionId: cashbackSubdivision.id,
        isActive: true,
      },
      {
        branchId: branch.id,
        subdivisionId: frozenDrinksSubdivision.id,
        isActive: true,
      },
    ],
  });

  console.log('✅ Subdivisions assigned to branch');

  // Create Categories for Cashback & Accessories
  const mobileAccessoriesCategory = await prisma.category.create({
    data: {
      name: 'Mobile Accessories',
      subdivisionId: cashbackSubdivision.id,
      description: 'Phone cases, chargers, screen protectors',
      displayOrder: 1,
      isActive: true,
    },
  });

  const cashbackServicesCategory = await prisma.category.create({
    data: {
      name: 'Cashback Services',
      subdivisionId: cashbackSubdivision.id,
      description: 'Mobile money cashback services',
      displayOrder: 2,
      isActive: true,
    },
  });

  // Create Categories for Frozen & Drinks
  const beveragesCategory = await prisma.category.create({
    data: {
      name: 'Beverages',
      subdivisionId: frozenDrinksSubdivision.id,
      description: 'Soft drinks, juices, water',
      displayOrder: 1,
      isActive: true,
    },
  });

  const frozenFoodsCategory = await prisma.category.create({
    data: {
      name: 'Frozen Foods',
      subdivisionId: frozenDrinksSubdivision.id,
      description: 'Frozen chicken, fish, vegetables',
      displayOrder: 2,
      isActive: true,
    },
  });

  const iceCreamCategory = await prisma.category.create({
    data: {
      name: 'Ice Cream & Desserts',
      subdivisionId: frozenDrinksSubdivision.id,
      description: 'Ice cream, frozen desserts',
      displayOrder: 3,
      isActive: true,
    },
  });

  console.log('✅ Categories created');

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

  console.log(`✅ Admin user created username: ${admin.username}`);

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
      assignedSubdivision: ProductSubdivision.FROZEN_DRINKS,
    },
  });

  console.log(`✅ Cashier user created username: ${cashier.username}`);

  // Create Sample Products
  const products = await Promise.all([
    // Beverage product
    prisma.product.create({
      data: {
        name: 'Coca Cola 500ml',
        sku: 'DRINK-001',
        barcode: '5000112637588',
        categoryId: beveragesCategory.id,
        subdivision: ProductSubdivision.FROZEN_DRINKS,
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

    // Mobile accessory with variants
    prisma.product.create({
      data: {
        name: 'Phone Case',
        sku: 'ACC-001',
        categoryId: mobileAccessoriesCategory.id,
        subdivision: ProductSubdivision.CASHBACK_ACCESSORIES,
        hasVariants: true,
        taxable: true,
        branchId: branch.id,
        variants: {
          create: [
            {
              name: 'iPhone 14 - Black',
              sku: 'ACC-001-IP14-BLK',
              barcode: '1234567890001',
              costPrice: 1000,
              sellingPrice: 2000,
              quantityInStock: 50,
              lowStockThreshold: 10,
              attributes: JSON.stringify({ model: 'iPhone 14', color: 'Black' }),
            },
            {
              name: 'iPhone 14 - Clear',
              sku: 'ACC-001-IP14-CLR',
              barcode: '1234567890002',
              costPrice: 1000,
              sellingPrice: 2000,
              quantityInStock: 75,
              lowStockThreshold: 10,
              attributes: JSON.stringify({ model: 'iPhone 14', color: 'Clear' }),
            },
            {
              name: 'Samsung S23 - Black',
              sku: 'ACC-001-S23-BLK',
              barcode: '1234567890003',
              costPrice: 900,
              sellingPrice: 1800,
              quantityInStock: 60,
              lowStockThreshold: 10,
              attributes: JSON.stringify({ model: 'Samsung S23', color: 'Black' }),
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
        categoryId: frozenFoodsCategory.id,
        subdivision: ProductSubdivision.FROZEN_DRINKS,
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

    // Ice cream product
    prisma.product.create({
      data: {
        name: 'Vanilla Ice Cream 500ml',
        sku: 'ICE-001',
        barcode: '9876543210123',
        categoryId: iceCreamCategory.id,
        subdivision: ProductSubdivision.FROZEN_DRINKS,
        hasVariants: false,
        costPrice: 800,
        sellingPrice: 1500,
        quantityInStock: 30,
        unitType: UnitType.PIECE,
        lowStockThreshold: 5,
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
