const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('adminsec123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nsec.com' },
    update: {},
    create: {
      email: 'admin@nsec.com',
      name: 'Admin User',
      hashedPassword: adminPassword,
      role: 'admin',
      isAdmin: true,
    },
  });
  console.log({ admin });

  // Create normal users
  const normalUsers = [
    {
      email: '*************',
      name: 'user1',
      password: '**********',
    },
    {
      email: '***********',
      name: 'user2',
      password: '************',
    },
    {
      email: '*********',
      name: 'user3',
      password: '**********',
    },
  ];

  for (const user of normalUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        hashedPassword: hashedPassword,
        role: 'user',
        isAdmin: false,
      },
    });
    console.log({ createdUser });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
