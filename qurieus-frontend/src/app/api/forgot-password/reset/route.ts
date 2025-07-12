import { prisma } from "@/utils/prismaDB";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendResetPasswordEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
	const startTime = Date.now();
	
	try {
		const body = await request.json();
		const { email } = body;

		logger.info("Forgot Password API: Processing password reset request", { email });

		if (!email) {
			logger.warn("Forgot Password API: Missing email field");
			return new NextResponse("Missing Fields", { status: 400 });
		}

		const formatedEmail = email.toLowerCase();

		const user = await prisma.user.findUnique({
			where: {
				email: formatedEmail,
			},
		});

		if (!user) {
			logger.warn("Forgot Password API: User not found", { email: formatedEmail });
			return new NextResponse("User doesn't exist", { status: 400 });
		}

		logger.info("Forgot Password API: User found, generating reset token", { 
			email: formatedEmail, 
			userId: user.id 
		});

		const resetToken = crypto.randomBytes(20).toString("hex");

		const passwordResetTokenExp = new Date();
		passwordResetTokenExp.setMinutes(passwordResetTokenExp.getMinutes() + 10);

		await prisma.user.update({
			where: {
				email: formatedEmail,
			},
			data: {
				passwordResetToken: resetToken,
				passwordResetTokenExp,
			},
		});

		const resetURL = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;

		try {
			await sendResetPasswordEmail(formatedEmail, resetURL);
			
			const responseTime = Date.now() - startTime;
			logger.info("Forgot Password API: Reset email sent successfully", { 
				email: formatedEmail, 
				userId: user.id,
				responseTime 
			});
			
			return NextResponse.json("An email has been sent to your email", {
				status: 200,
			});
		} catch (error) {
			const responseTime = Date.now() - startTime;
			logger.error("Forgot Password API: Error sending reset email", { 
				email: formatedEmail, 
				userId: user.id,
				error: error instanceof Error ? error.message : String(error),
				responseTime 
			});
			
			return NextResponse.json("An error has occurred. Please try again!", {
				status: 500,
			});
		}
	} catch (error: any) {
		const responseTime = Date.now() - startTime;
		logger.error("Forgot Password API: Error processing reset request", { 
			error: error.message, 
			responseTime,
			stack: error.stack 
		});
		
		return NextResponse.json("An error has occurred. Please try again!", {
			status: 500,
		});
	}
}
