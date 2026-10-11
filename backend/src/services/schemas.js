import { z } from "zod";
const text = (max) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine(
      (value) =>
        !/[<>]/.test(value) &&
        !Array.from(value).some((character) => character.charCodeAt(0) < 9),
      "Gunakan teks biasa tanpa tag HTML.",
    );
export const safeUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (value === "") return true;
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Gunakan URL http atau https.");
const imageUrl = z
  .string()
  .max(2048)
  .refine(
    (value) =>
      value === "" || /^\/(?:samples|uploads)\/[a-zA-Z0-9_.-]+$/.test(value),
    "Gunakan gambar yang diunggah atau gambar contoh.",
  );
export const profileSchema = z.object({
  name: text(100),
  role: text(150),
  intro: text(1000),
  location: text(150),
  availability: text(150),
  avatarUrl: imageUrl,
  avatarAlt: text(200),
  cvUrl: safeUrl,
  footerNote: text(300),
  projectHeading: text(150),
  skillHeading: text(150),
  contactHeading: text(150),
  contactIntro: text(500),
  testimonialHeading: text(150),
  navProjects: text(40),
  navSkills: text(40),
  navContact: text(40),
  projectCta: text(60),
  contactCta: text(60),
  cvLabel: text(60),
  copyright: text(150),
  exampleMode: z.boolean(),
});
export const projectSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),
  title: text(150),
  description: text(500),
  content: text(20000),
  imageUrl: imageUrl.refine((value) => value.length > 0),
  imageAlt: text(200),
  techStack: z.array(text(50)).min(1).max(20),
  demoUrl: safeUrl,
  repoUrl: safeUrl,
  featured: z.boolean(),
  sortOrder: z.number().int().min(0).max(9999),
});
export const skillSchema = z.object({
  name: text(80),
  category: text(80),
  context: text(500),
  sortOrder: z.number().int().min(0).max(9999),
});
export const testimonialSchema = z.object({
  name: text(100),
  relation: text(150),
  quote: text(2000),
  photoUrl: imageUrl,
  status: z.enum(["draft", "published"]),
});
export const socialSchema = z.object({
  label: text(60),
  url: safeUrl.refine((value) => value.length > 0),
  sortOrder: z.number().int().min(0).max(9999),
});
export const contactSchema = z.object({
  name: text(100),
  email: z.email().max(254),
  message: text(5000).refine(
    (value) => value.length >= 20,
    "Pesan minimal 20 karakter.",
  ),
  website: z.string().max(200).default(""),
});
export const loginSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(1)
    .max(128)
    .refine(
      (value) => Buffer.byteLength(value, "utf8") <= 72,
      "Password maksimal 72 byte.",
    ),
});
