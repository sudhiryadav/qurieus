import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
}

export async function sendVerificationEmail(email: string, code: string) {
  return sendEmail({
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify your email address</h2>
        <p>Thank you for signing up! Please use the following code to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
          <strong>${code}</strong>
        </div>
        <p>This code will expire in 24 hours.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
    `,
  });
}

export { transporter }; 