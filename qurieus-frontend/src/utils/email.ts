import { sendEmail, transporter } from "@/lib/email";

export async function sendContactEmail(data: {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}) {
  const { fullName, email, phone, message } = data;

  const html = `
    <div>
      <h1>New Contact Form Submission</h1>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong> ${message}</p>
    </div>
  `;

  try {
    process.env.CONTACT_EMAIL && await sendEmail({
      to: process.env.CONTACT_EMAIL,
      subject: `New Contact Form Submission from ${fullName}`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
