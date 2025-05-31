import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function POST(request: any) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json("Missing Fields", { status: 400 });
  }

  const exist = await prisma.users.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (exist) {
    return NextResponse.json("User already exists!", { status: 500 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.users.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      company: "", // Required field
      plan: "basic", // Default plan
      subscription_type: "monthly", // Default subscription type
      subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  return NextResponse.json("User created successfully!", { status: 200 });
}
