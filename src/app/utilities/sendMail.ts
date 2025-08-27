import nodeMailer from "nodemailer";
import { envConfig } from "../config/env";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import path from "path";
import ejs from "ejs";
import AppError from "../errors/appError";

const transporter = nodeMailer.createTransport({
  secure: true,
  auth: {
    user: envConfig.SMTP.SMTP_USER,
    pass: envConfig.SMTP.SMTP_PASS,
  },
  port: Number(envConfig.SMTP.SMTP_PORT),
  host: envConfig.SMTP.SMTP_HOST,
} as SMTPTransport.Options);

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
      from: envConfig.SMTP.SMTP_FROM,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });
    console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
  } catch (error: any) {
    console.log("email sending error", error.message);
    throw new AppError(401, "Email error", error);
  }
};
