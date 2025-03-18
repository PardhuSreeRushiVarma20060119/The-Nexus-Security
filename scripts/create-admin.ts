import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@nsec.com';
  const password = 'adminsec123';

  const hashedPassword = await hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      hashedPassword,
      isAdmin: true,
    },
    create: {
      email,
      name: 'Admin User',
      hashedPassword,
      isAdmin: true,
    },
  });

  console.log('Admin user created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 