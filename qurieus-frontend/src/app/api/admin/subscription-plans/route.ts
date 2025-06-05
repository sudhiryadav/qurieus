import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is super admin
    const user = await prisma.users.findUnique({
      where: { email: session.user?.email! },
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is super admin
    const user = await prisma.users.findUnique({
      where: { email: session.user?.email! },
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await req.json();
    const { name, description, price, currency, features, isActive } = body;

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        description,
        price,
        currency,
        features,
        isActive,
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 