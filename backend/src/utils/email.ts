import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT, 10),
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
});

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  
  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f17; color: #f1f5f9; padding: 40px 20px; border-radius: 8px;">
      <div style="max-width: 500px; margin: 0 auto; background: #161b26; border: 1px solid #262d3d; border-radius: 8px; padding: 32px;">
        <h2 style="color: #f59e0b; margin-top: 0; font-size: 20px; font-weight: 600;">Reset Your Password</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">We received a request to reset your TeamSync password. Click the button below to proceed.</p>
        <div style="margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #f59e0b; color: #0b0f17; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">This link is valid for 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Reset your TeamSync password",
      html: htmlContent
    });
    console.log(`✉️ Password reset email sent to ${email}`);
  } catch (err) {
    console.warn(`⚠️ Could not send reset email (development mode token: ${token})`);
  }
};
