import {
  PrismaClient,
  UserRole,
  ProductCategory,
  UnitType,
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
    },
  });

  console.log(`✅ Cashier user created username: ${cashier.username}`);

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
