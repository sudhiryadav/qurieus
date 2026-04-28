import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles, invalidateUserCache } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

export const GET = RequireRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN])(async (request: Request) => {
  const session = await getServerSession(authOptions);
  // Only allow admin/superadmin
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const showDeleted = searchParams.get('show_deleted'); // '', 'true', 'all'
  const users = await prisma.user.findMany({
    where: {
      role: { not: 'AGENT' },
      ...(showDeleted === 'all'
        ? {}
        : showDeleted === 'true'
          ? { deleted_at: { not: null } }
          : { deleted_at: null }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
      deleted_at: true,
      company: true,
      plan: true,
      subscription_type: true,
      subscription_start_date: true,
      subscription_end_date: true,
      is_verified: true,
      jobTitle: true,
      bio: true,
      phone: true,
      subscriptions: {
        select: {
          plan: {
            select: {
              name: true
            }
          }
        },
        where: {
          status: 'active'
        },
        take: 1
      },
      _count: {
        select: {
          documents: true
        }
      }
    },
    orderBy: { name: 'asc' },
  });
  
  // Ensure no passwords are returned
  const usersWithoutPasswords = users.map(user => {
    const { password, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  });
  
  return NextResponse.json({ users: usersWithoutPasswords });
});

export const PATCH = RequireRoles([UserRole.SUPER_ADMIN])(async (req: NextRequest) => {
  try {
    const data = await req.json();
    const { id, password, ...update } = data;
    
    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Clean up the update data - convert empty strings to null for optional fields
    const cleanUpdateData = {
      ...update,
      // Convert empty strings to null for optional enum fields
      plan: update.plan && update.plan !== '' ? update.plan : null,
      subscription_type: update.subscription_type && update.subscription_type !== '' ? update.subscription_type : null,
      // Convert empty strings to null for optional string fields
      company: update.company && update.company !== '' ? update.company : null,
      jobTitle: update.jobTitle && update.jobTitle !== '' ? update.jobTitle : null,
      bio: update.bio && update.bio !== '' ? update.bio : null,
      phone: update.phone && update.phone !== '' ? update.phone : null
    };

    // Handle password update if provided
    if (password) {
      const bcrypt = require('bcryptjs');
      cleanUpdateData.password = await bcrypt.hash(password, 10);
    }

    // Update user with cleaned data
    const user = await prisma.user.update({
      where: { id },
      data: cleanUpdateData,
    });

    // Invalidate user cache after update
    await invalidateUserCache(id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: "Failed to update user",
        details: error.message 
      },
      { status: 500 }
    );
  }
});

export const POST = RequireRoles([UserRole.SUPER_ADMIN])(async (req: NextRequest) => {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.email || !data.name || !data.password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Clean up the data - convert empty strings to null for optional fields
    const cleanData = {
      ...data,
      password: hashedPassword,
      role: data.role || 'USER',
      is_active: data.is_active !== undefined ? data.is_active : true,
      is_verified: data.is_verified !== undefined ? data.is_verified : false,
      // Convert empty strings to null for optional enum fields
      plan: data.plan && data.plan !== '' ? data.plan : null,
      subscription_type: data.subscription_type && data.subscription_type !== '' ? data.subscription_type : null,
      // Convert empty strings to null for optional string fields
      company: data.company && data.company !== '' ? data.company : null,
      jobTitle: data.jobTitle && data.jobTitle !== '' ? data.jobTitle : null,
      bio: data.bio && data.bio !== '' ? data.bio : null,
      phone: data.phone && data.phone !== '' ? data.phone : null
    };

    // Create user with cleaned data
    const user = await prisma.user.create({
      data: cleanData
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: "Failed to create user",
        details: error.message 
      },
      { status: 500 }
    );
  }
}); 
