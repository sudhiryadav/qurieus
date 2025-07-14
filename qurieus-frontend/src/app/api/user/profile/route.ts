import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

export const PUT = RequireRoles([UserRole.USER])(async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
  const user = session!.user!;
    
    // Parse the request body
    const { name, company, jobTitle, bio } = await req.json();
    
    // Update user profile in the database
    const updatedUser = await prisma.user.update({
      where: {
      id: user.id,
      },
      data: {
        name,
        company,
        jobTitle,
        bio,
      },
    });
    
    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        company: updatedUser.company,
        jobTitle: updatedUser.jobTitle,
        bio: updatedUser.bio,
      },
    });
});

export const GET = RequireRoles([UserRole.USER])(async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
  const user = session!.user!;
    
    // Get user profile from the database
  const userProfile = await prisma.user.findUnique({
      where: {
      id: user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        jobTitle: true,
        bio: true,
      },
    });
    
  if (!userProfile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
  return NextResponse.json({ user: userProfile });
}); 