import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create subscription plans
  const plans = [
    {
      name: 'Free Trial',
      description: 'Perfect for evaluating our service',
      price: 0,
      currency: 'INR',
      features: [
        '5 documents',
        '10 MB storage',
        '25 queries/day',
        '7-day trial'
      ],
      isActive: true,
    },
    {
      name: 'Basic',
      description: 'Ideal for individuals',
      price: 499,
      currency: 'INR',
      features: [
        '25 documents',
        '100 MB storage',
        '100 queries/day',
        'Email support'
      ],
      isActive: true,
    },
    {
      name: 'Standard',
      description: 'Perfect for small teams',
      price: 999,
      currency: 'INR',
      features: [
        '100 documents',
        '500 MB storage',
        '500 queries/day',
        'Priority support',
        'Team collaboration'
      ],
      isActive: true,
    },
    {
      name: 'Pro',
      description: 'For power users and startups',
      price: 1999,
      currency: 'INR',
      features: [
        '500 documents',
        '2 GB storage',
        '2000 queries/day',
        '24/7 support',
        'Advanced analytics',
        'API access'
      ],
      isActive: true,
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      price: 0, // Custom pricing
      currency: 'INR',
      features: [
        'Custom document limits',
        'Custom storage limits',
        'Custom query limits',
        'Dedicated support',
        'Custom branding',
        'SLA guarantees',
        'Team management'
      ],
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  console.log('Subscription plans seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 