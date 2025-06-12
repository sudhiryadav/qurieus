import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.SITE_URL || "https://qurieus.com"}/images/logo/logo.svg`;
const year = new Date().getFullYear();

// Register partials
const partialsDir = path.resolve("./src/templates/emails/partials/");
fs.readdirSync(partialsDir).forEach((file) => {
  const matches = /^([^.]+).hbs$/.exec(file);
  if (!matches) return;
  const partialName = `partials/${matches[1]}`;
  const partialPath = path.join(partialsDir, file);
  const partialContent = fs.readFileSync(partialPath, "utf8");
  handlebars.registerPartial(partialName, partialContent);
});

function renderTemplate(templateName: string, context: any) {
  const templatePath = path.resolve(`./src/templates/emails/${templateName}.hbs`);
  const templateSource = fs.readFileSync(templatePath, "utf8");
  const template = handlebars.compile(templateSource);
  return template({ ...context, logoUrl, year });
}

export async function sendEmail({ to, subject, template, context, html }: { to: string; subject: string; template?: string; context?: any; html?: string }) {
  let htmlContent = html;
  if (template) {
    htmlContent = renderTemplate(template, context || {});
  }
  const mailOptions: any = {
    from: process.env.SMTP_FROM || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME,
    to,
    subject,
    html: htmlContent,
  };
  await transporter.sendMail(mailOptions);
}

export async function sendVerificationEmail(email: string, code: string) {
  return sendEmail({
    to: email,
    subject: "Verify your email address",
    template: "verification",
    context: { code },
  });
}

export async function sendContactEmail(data: { fullName: string; email: string; phone: string; message: string }) {
  return process.env.CONTACT_EMAIL && await sendEmail({
    to: process.env.CONTACT_EMAIL,
    subject: `New Contact Form Submission from ${data.fullName}`,
    template: "contact",
    context: data,
  });
}

export async function sendResetPasswordEmail(email: string, resetUrl: string) {
  return sendEmail({
    to: email,
    subject: "Reset your password",
    template: "reset-password",
    context: { resetUrl },
  });
}

export async function sendConfigurationNotificationEmail(data: { 
  userId: string; 
  query: string; 
  timestamp: string;
  adminEmail: string;
  userEmail: string;
}) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.SITE_URL || "https://qurieus.com"}/user/dashboard`;
  
  // Send to admin
  await sendEmail({
    to: data.adminEmail,
    subject: "System Configuration Required - No Documents Found",
    template: "configuration-notification",
    context: { ...data, dashboardUrl },
  });

  // Send to user
  await sendEmail({
    to: data.userEmail,
    subject: "System Configuration Required - No Documents Found",
    template: "configuration-notification",
    context: { ...data, dashboardUrl },
  });
}

export { transporter }; 