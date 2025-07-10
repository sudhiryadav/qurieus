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

export const footerData = {
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
  supportAddress: process.env.NEXT_PUBLIC_SUPPORT_ADDRESS,
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE,
  year: new Date().getFullYear(),
}

const logoUrl = `https://qurieus.com/images/logo/logo.png`;
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

export async function sendEmail({ to, subject, template, context, html,attachments }: { to: string; subject: string; template?: string; context?: any; html?: string, attachments?: any }) {
  let htmlContent = html;
  if (template) {
    htmlContent = renderTemplate(template, context || {});
  }
  const mailOptions: any = {
    from: process.env.SMTP_FROM || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME,
    to,
    subject,
    html: htmlContent,
    attachments,
  };
  await transporter.sendMail(mailOptions);
}

export async function sendVerificationEmail(email: string, code: string) {
  console.log("Sending verification email to", email, code);
  return sendEmail({
    to: email,
    subject: "Verify your email address",
    template: "verification",
    context: { code, ...footerData },
  });
}

export async function sendContactEmail(data: { fullName: string; email: string; phone: string; message: string }) {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL && await sendEmail({
    to: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    subject: `New Contact Form Submission from ${data.fullName}`,
    template: "contact",
    context: { ...data, ...footerData },
  });
}

export async function sendResetPasswordEmail(email: string, resetUrl: string) {
  return sendEmail({
    to: email,
    subject: "Reset your password",
    template: "reset-password",
    context: { resetUrl, ...footerData },
  });
}

export async function sendConfigurationNotificationEmail(data: { 
  userId: string; 
  query: string; 
  timestamp: string;
  adminEmail: string;
  userEmail: string;
}) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard`;
  
  // Send to admin
  await sendEmail({
    to: data.adminEmail,
    subject: "System Configuration Required - No Documents Found",
    template: "configuration-notification",
    context: { ...data, dashboardUrl, ...footerData },
  });

  // Send to user
  await sendEmail({
    to: data.userEmail,
    subject: "System Configuration Required - No Documents Found",
    template: "configuration-notification",
    context: { ...data, dashboardUrl, ...footerData },
  });
}

export async function sendTrialStartedEmail(data: {
  email: string;
  name: string;
  trial_days: number;
  trial_end_date: string;
  max_docs: number;
  max_storage: number;
  max_queries: number;
}) {
  return sendEmail({
    to: data.email,
    subject: "Your Free Trial Has Started!",
    template: "trial-started",
    context: { ...data, ...footerData },
  });
}

export async function sendTrialExpiringEmail(data: {
  email: string;
  name: string;
  days_left: number;
  trial_end_date: string;
}) {
  return sendEmail({
    to: data.email,
    subject: data.days_left === 1 ? "Your Trial Expires Tomorrow!" : `Your Trial Expires in ${data.days_left} Days`,
    template: "trial-expiring",
    context: { ...data, ...footerData },
  });
}

export async function sendTrialExpiredEmail(data: {
  email: string;
  name: string;
  trial_end_date: string;
}) {
  return sendEmail({
    to: data.email,
    subject: "Your Trial Has Expired",
    template: "trial-expired",
    context: { ...data, ...footerData },
  });
}

export { transporter }; 