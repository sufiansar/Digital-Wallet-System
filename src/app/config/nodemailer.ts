import nodemailer from "nodemailer";
import { envConfig } from "./env";

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      host: envConfig.SMTP.SMTP_HOST,
      port: Number(envConfig.SMTP.SMTP_PORT),
      secure: true, // because you are using port 465
      auth: {
        user: envConfig.SMTP.SMTP_USER,
        pass: envConfig.SMTP.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: envConfig.SMTP.SMTP_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};
