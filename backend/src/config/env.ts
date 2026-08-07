import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/teamsync"),
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.string().default("6379"),
  REDIS_PASSWORD: z.string().optional().default(""),
  JWT_ACCESS_SECRET: z.string().default("teamsync_super_secret_access_token_key_2026_prod"),
  JWT_REFRESH_SECRET: z.string().default("teamsync_super_secret_refresh_token_key_2026_prod"),
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
