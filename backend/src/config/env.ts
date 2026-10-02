import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().default("mongodb+srv://harshsaini132159:2004%40Harshsaini@cluster0.wixojqi.mongodb.net/TeamSync?retryWrites=true&w=majority"),
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_URL: z.string().default("127.0.0.1"),
  REDIS_PORT: z.string().default("6379"),
  REDIS_PASSWORD: z.string().optional().default(""),
  JWT_ACCESS_SECRET: z.string().default("f6ae49bbcefa4ce04511c0eebc6ac1d27a95b50b277ad29b4dec2521da34737b"),
  JWT_REFRESH_SECRET: z.string().default("f8d4e70a402556e50b0688c9717c17518be194d6ac12510d5e04aa44bbd79d7edea02dfc0bccbb5d921d2a5815f4ffb88158c05192251df4a64abc19cea7c81f"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().default("http://localhost:3000"),
  SMTP_HOST: z.string().default("smtp.mailtrap.io"),
  SMTP_PORT: z.string().default("2525"),
  SMTP_USER: z.string().optional().default("test"),
  SMTP_PASS: z.string().optional().default("test"),
  EMAIL_FROM: z.string().default("TeamSync Security <no-reply@teamsync.app>"),
  GOOGLE_CLIENT_ID: z.string().optional().default("mock_google_client_id")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration.");
}

export const env = parsed.data;
