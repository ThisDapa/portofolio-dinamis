import "dotenv/config";
import { z } from "zod";
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.url(),
  PUBLIC_API_URL: z.url(),
  JWT_SECRET: z.string().min(48),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z
    .string()
    .min(16)
    .refine(
      (value) => Buffer.byteLength(value, "utf8") <= 72,
      "Password maksimal 72 byte.",
    ),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
});
export const config = envSchema.parse(process.env);
