const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

const prisma = new PrismaClient();

async function main() {
  // Create a branch first
  const branch = await prisma.branch.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: uuid.v4(),
      name: 'Main Branch',
      location: 'Main Location',
    },
  });

  // Create a test user
  const passwordHash = await bcrypt.hash('admin123', 10);

  const testUser = await prisma.user.upsert({
    where: { username: 'mamman' },
    update: {},
    create: {
      username: 'mamman',
      email: 'mamman@pos.com',
      passwordHash,
      role: UserRole.ADMIN,
      branchId: branch.id,
      firstName: 'Mamman',
      lastName: '',
    },
  });

  console.log('Seeded user:', testUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
