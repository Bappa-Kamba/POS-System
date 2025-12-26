const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const MAIN_BRANCH_ID = 'MAIN_BRANCH';
const ADMIN_USERNAME = 'admin';

async function main() {
  // Ensure main branch exists
  const branch = await prisma.branch.upsert({
    where: { id: MAIN_BRANCH_ID },
    update: {},
    create: {
      id: MAIN_BRANCH_ID,
      name: 'Main Branch',
      location: 'Main Location',
    },
  });

  // Ensure admin user exists
  const passwordHash = await bcrypt.hash('admin123', 10);

  let adminUser = await prisma.user.findUnique({
    where: { username: ADMIN_USERNAME },
  });

  if (adminUser && !adminUser.isActive) {
    await prisma.user.update({
      where: { username: ADMIN_USERNAME },
      data: { isActive: true },
    });
  }

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        username: ADMIN_USERNAME,
        email: 'admin@pos.local',
        passwordHash,
        role: UserRole.ADMIN,
        branchId: branch.id,
        firstName: 'System',
        lastName: 'Admin',
      },
    });
  }

  console.log('Seed complete');
  console.log({
    branchId: branch.id,
    adminUser: adminUser.username,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
