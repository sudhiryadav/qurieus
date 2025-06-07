import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('Sidrules@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'er.sudhir.yadav@gmail.com' },
    update: {},
    create: {
      email: 'er.sudhir.yadav@gmail.com',
      name: 'Sudhir Yadav',
      password: adminPassword,
      company: 'Qurieus',
      plan: 'BASIC',
      subscription_type: 'MONTHLY',
      subscription_start_date: new Date(),
      subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      role: 'SUPER_ADMIN',
      is_active: true,
      is_verified: true
    },
  });

  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 