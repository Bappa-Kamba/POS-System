const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const MAIN_BRANCH_ID = 'MAIN_BRANCH';
const ADMIN_USERNAME = 'mamman';

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

  const adminUser = await prisma.user.upsert({
    where: { username: ADMIN_USERNAME },
    update: {},
    create: {
      username: ADMIN_USERNAME,
      email: 'mamman@pos.com',
      passwordHash,
      role: UserRole.ADMIN,
      branchId: branch.id,
      firstName: 'Mamman',
      lastName: '',
    },
  });

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
