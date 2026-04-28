import bcrypt from "bcrypt";
import { prisma } from "@/utils/prismaDB";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
	const startTime = Date.now();
	
	try {
		const body = await request.json();
		const { email, password } = body;

		logger.info("Update Password API: Processing password update request", { 
			email, 
			hasPassword: !!password 
		});

		if (!email || !password) {
			logger.warn("Update Password API: Missing required fields", { 
				hasEmail: !!email, 
				hasPassword: !!password 
			});
			return new NextResponse("Missing Fields", { status: 400 });
		}

		const formatedEmail = email.toLowerCase();

		const user = await prisma.user.findUnique({
			where: {
				email: formatedEmail,
			},
		});

		if (!user) {
			throw new Error("Email does not exists");
		}

		logger.info("Update Password API: User found, updating password", { 
			email: formatedEmail, 
			userId: user.id 
		});

		const hashedPassword = await bcrypt.hash(password, 10);

		try {
			await prisma.user.update({
				where: {
					email: formatedEmail,
				},
				data: {
					password: hashedPassword,
					passwordResetToken: null,
					passwordResetTokenExp: null,
				},
			});

			const responseTime = Date.now() - startTime;
			logger.info("Update Password API: Password updated successfully", { 
				email: formatedEmail, 
				userId: user.id,
				responseTime 
			});

			return NextResponse.json("Password Updated", { status: 200 });
		} catch (error) {
			const responseTime = Date.now() - startTime;
			logger.error("Update Password API: Error updating password in database", { 
				email: formatedEmail, 
				userId: user.id,
				error: error instanceof Error ? error.message : String(error),
				responseTime 
			});
			
			return new NextResponse("Internal Error", { status: 500 });
		}
	} catch (error: any) {
		const responseTime = Date.now() - startTime;
		logger.error("Update Password API: Error processing password update", { 
			error: error.message, 
			responseTime,
			stack: error.stack 
		});
		
		return new NextResponse("Internal Error", { status: 500 });
	}
}
