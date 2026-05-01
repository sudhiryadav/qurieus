import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

const sanitizeProfileField = (
  value: unknown,
  maxLength: number
): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
};

export const PUT = RequireRoles([UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN])(async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
  const user = session!.user!;
    
    // Parse the request body
    const { name, company, jobTitle, bio } = await req.json();

    const sanitizedName = sanitizeProfileField(name, 120);
    const sanitizedCompany = sanitizeProfileField(company, 120);
    const sanitizedJobTitle = sanitizeProfileField(jobTitle, 120);
    const sanitizedBio = sanitizeProfileField(bio, 1000);

    if (name !== undefined && typeof name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (company !== undefined && typeof company !== "string") {
      return NextResponse.json({ error: "Invalid company" }, { status: 400 });
    }
    if (jobTitle !== undefined && typeof jobTitle !== "string") {
      return NextResponse.json({ error: "Invalid job title" }, { status: 400 });
    }
    if (bio !== undefined && typeof bio !== "string") {
      return NextResponse.json({ error: "Invalid bio" }, { status: 400 });
    }
    
    // Update user profile in the database
    const updatedUser = await prisma.user.update({
      where: {
      id: user.id,
      },
      data: {
        name: sanitizedName,
        company: sanitizedCompany,
        jobTitle: sanitizedJobTitle,
        bio: sanitizedBio,
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
        image: updatedUser.image,
      },
    });
});

export const GET = RequireRoles([UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN])(async (req: NextRequest) => {
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
        image: true,
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