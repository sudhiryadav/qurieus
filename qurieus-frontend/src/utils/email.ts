import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Configure Handlebars
const handlebarOptions = {
  viewEngine: {
    extName: ".hbs",
    partialsDir: path.resolve("./src/templates/emails/"),
    defaultLayout: false,
  },
  viewPath: path.resolve("./src/templates/emails/"),
  extName: ".hbs",
};

transporter.use("compile", hbs(handlebarOptions));

export async function sendContactEmail(data: {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}) {
  const { fullName, email, phone, message } = data;

  const mailOptions = {
    from: process.env.SMTP_USERNAME,
    to: process.env.CONTACT_EMAIL || 'er.sudhir.yadav@gmail.com',
    subject: `New Contact Form Submission from ${fullName}`,
    template: "contact",
    context: {
      fullName,
      email,
      phone,
      message,
    },
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const mailOptions = {
    from: process.env.SMTP_USERNAME,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
