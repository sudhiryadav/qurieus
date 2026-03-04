import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { logger } from "@/lib/logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
  // Optimized timeout settings for faster sending
  connectionTimeout: 15000, // 15 seconds (reduced from 60)
  greetingTimeout: 10000,   // 10 seconds (reduced from 30)
  socketTimeout: 15000,     // 15 seconds (reduced from 60)
  // Add TLS options for better compatibility
  tls: {
    rejectUnauthorized: false
  },
  // Add connection pooling for better performance
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit: 5, // Send max 5 emails per second
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qurieus.com";

export const footerData = {
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
  supportAddress: process.env.NEXT_PUBLIC_SUPPORT_ADDRESS,
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE,
  year: new Date().getFullYear(),
  appUrl,
  privacyPolicyUrl: `${appUrl}/privacy-policy`,
  termsOfServiceUrl: `${appUrl}/terms-of-service`,
  refundPolicyUrl: `${appUrl}/refund-policy`,
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
  try {
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
      // Add proper headers to improve deliverability
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'X-Mailer': 'Qurieus Email System',
        'X-Report-Abuse': 'Please report abuse here: ' + (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@qurieus.com'),
        'List-Unsubscribe': '<mailto:' + (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@qurieus.com') + '?subject=unsubscribe>',
        'Precedence': 'bulk',
        'Message-ID': '<' + Date.now() + '.' + Math.random().toString(36).substr(2, 9) + '@qurieus.com>'
      },
      // Add text version for better deliverability
      text: htmlContent ? htmlContent.replace(/<[^>]*>/g, '') : '',
    };
    
    logger.info("Sending email", { to, subject, template: template || 'custom' });
    await transporter.sendMail(mailOptions);
    logger.info("Email sent successfully", { to, subject });
  } catch (error) {
    logger.error("Failed to send email", { 
      to, 
      subject, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export async function sendVerificationEmail(email: string, code: string) {
  logger.info("Sending verification email", { email, code });
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
  let subject: string;
  
  if (data.days_left === 0) {
    subject = "Your Trial Expires Today!";
  } else if (data.days_left === 1) {
    subject = "Your Trial Expires Tomorrow!";
  } else {
    subject = `Your Trial Expires in ${data.days_left} Days`;
  }
  
  return sendEmail({
    to: data.email,
    subject,
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

export async function sendEscalationNotificationToUser(data: {
  userEmail: string;
  userMessage: string;
}) {
  return sendEmail({
    to: data.userEmail,
    subject: "We've Received Your Request - Support Team Notified",
    template: "escalation-notification-user",
    context: { ...data, ...footerData },
  });
}

export async function sendEscalationNotificationToAgents(data: {
  agentEmails: string[];
  userId: string;
  visitorId: string;
  conversationId: string;
  userMessage: string;
  escalationReason: string;
  escalatedAt: string;
}) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/agent/dashboard`;
  
  // Send to all agents
  const emailPromises = data.agentEmails.map(email => 
    sendEmail({
      to: email,
      subject: "⚠️ Chat Escalation Alert - No Agents Available",
      template: "escalation-notification-agent",
      context: { ...data, dashboardUrl, ...footerData },
    })
  );
  
  return Promise.all(emailPromises);
}

export { transporter }; 