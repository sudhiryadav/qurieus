#!/usr/bin/env node
/**
 * Test SMTP email configuration.
 * Run from qurieus-frontend: node scripts/test-email.js your@email.com
 * Requires .env to be loaded (use: yarn dotenv -e .env -- node scripts/test-email.js your@email.com)
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

const toEmail = process.argv[2] || process.env.ADMIN_EMAIL || 'hello@qurieus.com';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function main() {
  console.log('Testing SMTP configuration...');
  console.log('  Host:', process.env.SMTP_HOST);
  console.log('  Port:', process.env.SMTP_PORT);
  console.log('  User:', process.env.SMTP_USERNAME || process.env.SMTP_USER);
  console.log('  From:', process.env.SMTP_FROM_EMAIL);
  console.log('  To:', toEmail);
  console.log('');

  try {
    await transporter.verify();
    console.log('✓ SMTP connection verified');
  } catch (err) {
    console.error('✗ SMTP verification failed:', err.message);
    process.exit(1);
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME,
      to: toEmail,
      subject: 'Qurieus SMTP Test',
      html: '<p>This is a test email from Qurieus. SMTP is configured correctly.</p>',
    });
    console.log('✓ Test email sent:', info.messageId);
  } catch (err) {
    console.error('✗ Failed to send email:', err.message);
    process.exit(1);
  }
}

main();
