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

  // Seed subscription plans
  const plans = [
    {
      name: 'Free Trial',
      description: '7-14 days',
      price: 0,
      currency: 'INR',
      features: [],
      isActive: true,
      idealFor: 'Evaluators',
      keyLimits: '5 docs · 10 MB · 25 queries/day',
      maxDocs: 5,
      maxStorageMB: 10,
      maxQueriesPerDay: 25,
    },
    {
      name: 'Basic',
      description: '',
      price: 499,
      currency: 'INR',
      features: [],
      isActive: true,
      idealFor: 'Individuals',
      keyLimits: '25 docs · 100 MB · 100 queries/day',
      maxDocs: 25,
      maxStorageMB: 100,
      maxQueriesPerDay: 100,
    },
    {
      name: 'Standard',
      description: '',
      price: 999,
      currency: 'INR',
      features: [],
      isActive: true,
      idealFor: 'Small Teams',
      keyLimits: '100 docs · 500 MB · 500 queries/day',
      maxDocs: 100,
      maxStorageMB: 500,
      maxQueriesPerDay: 500,
    },
    {
      name: 'Pro',
      description: '',
      price: 1999,
      currency: 'INR',
      features: [],
      isActive: true,
      idealFor: 'Power Users / Startups',
      keyLimits: '500 docs · 2 GB · 2000 queries/day',
      maxDocs: 500,
      maxStorageMB: 2048,
      maxQueriesPerDay: 2000,
    },
    {
      name: 'Enterprise',
      description: 'Custom',
      price: 0,
      currency: 'INR',
      features: [],
      isActive: true,
      idealFor: 'Large Orgs',
      keyLimits: 'Custom limits · SLAs · Branding · Team support',
      maxDocs: null,
      maxStorageMB: null,
      maxQueriesPerDay: null,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  console.log({ admin, plansSeeded: plans.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 