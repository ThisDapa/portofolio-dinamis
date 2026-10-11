import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { z } from "zod";
import { db } from "../services/db.js";
import {
  profileSchema,
  projectSchema,
  skillSchema,
  testimonialSchema,
  socialSchema,
} from "../services/schemas.js";
export const adminRouter = Router();
adminRouter.get("/dashboard", async (req, res) => {
  const [projects, skills, testimonials, unread, messages] = await Promise.all([
    db.project.count(),
    db.skill.count(),
    db.testimonial.count(),
    db.message.count({ where: { readAt: null } }),
    db.message.count(),
  ]);
  res.json({ projects, skills, testimonials, unread, messages });
});
adminRouter.get("/profile", async (req, res) => {
  res.json(await db.profile.findUniqueOrThrow({ where: { id: 1 } }));
});
adminRouter.put("/profile", async (req, res) => {
  res.json(
    await db.profile.update({
      where: { id: 1 },
      data: profileSchema.parse(req.body),
    }),
  );
});
adminRouter.get("/projects", async (req, res) => {
  res.json(await db.project.findMany({ orderBy: { sortOrder: "asc" } }));
});
adminRouter.post("/projects", async (req, res) => {
  res
    .status(201)
    .json(await db.project.create({ data: projectSchema.parse(req.body) }));
});
adminRouter.put("/projects/:id", async (req, res) => {
  res.json(
    await db.project.update({
      where: { id: String(req.params.id) },
      data: projectSchema.parse(req.body),
    }),
  );
});
adminRouter.delete("/projects/:id", async (req, res) => {
  await db.project.delete({ where: { id: String(req.params.id) } });
  res.sendStatus(204);
});
adminRouter.get("/skills", async (req, res) => {
  res.json(await db.skill.findMany({ orderBy: { sortOrder: "asc" } }));
});
adminRouter.post("/skills", async (req, res) => {
  res
    .status(201)
    .json(await db.skill.create({ data: skillSchema.parse(req.body) }));
});
adminRouter.put("/skills/:id", async (req, res) => {
  res.json(
    await db.skill.update({
      where: { id: String(req.params.id) },
      data: skillSchema.parse(req.body),
    }),
  );
});
adminRouter.delete("/skills/:id", async (req, res) => {
  await db.skill.delete({ where: { id: String(req.params.id) } });
  res.sendStatus(204);
});
adminRouter.get("/testimonials", async (req, res) => {
  res.json(await db.testimonial.findMany());
});
adminRouter.post("/testimonials", async (req, res) => {
  res
    .status(201)
    .json(
      await db.testimonial.create({ data: testimonialSchema.parse(req.body) }),
    );
});
adminRouter.put("/testimonials/:id", async (req, res) => {
  res.json(
    await db.testimonial.update({
      where: { id: String(req.params.id) },
      data: testimonialSchema.parse(req.body),
    }),
  );
});
adminRouter.delete("/testimonials/:id", async (req, res) => {
  await db.testimonial.delete({ where: { id: String(req.params.id) } });
  res.sendStatus(204);
});
adminRouter.get("/socials", async (req, res) => {
  res.json(await db.social.findMany({ orderBy: { sortOrder: "asc" } }));
});
adminRouter.post("/socials", async (req, res) => {
  res
    .status(201)
    .json(await db.social.create({ data: socialSchema.parse(req.body) }));
});
adminRouter.put("/socials/:id", async (req, res) => {
  res.json(
    await db.social.update({
      where: { id: String(req.params.id) },
      data: socialSchema.parse(req.body),
    }),
  );
});
adminRouter.delete("/socials/:id", async (req, res) => {
  await db.social.delete({ where: { id: String(req.params.id) } });
  res.sendStatus(204);
});
adminRouter.get("/messages", async (req, res) => {
  res.json(
    await db.message.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
  );
});
adminRouter.patch("/messages/:id", async (req, res) => {
  const { read } = z.object({ read: z.boolean() }).parse(req.body);
  res.json(
    await db.message.update({
      where: { id: String(req.params.id) },
      data: { readAt: read ? new Date() : null },
    }),
  );
});
adminRouter.delete("/messages/:id", async (req, res) => {
  await db.message.delete({ where: { id: String(req.params.id) } });
  res.sendStatus(204);
});
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});
adminRouter.post("/uploads", upload.single("image"), async (req, res) => {
  if (
    !req.file ||
    !["image/jpeg", "image/png", "image/webp"].includes(req.file.mimetype)
  ) {
    res.status(400).json({ error: "Pilih gambar JPEG, PNG, atau WebP." });
    return;
  }
  let output;
  try {
    const source = sharp(req.file.buffer, { limitInputPixels: 25_000_000 });
    const metadata = await source.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format ?? ""))
      throw new Error("Unsupported format");
    output = await source
      .rotate()
      .resize({
        width: 1920,
        height: 1920,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    res
      .status(400)
      .json({ error: "Isi gambar tidak valid atau resolusi terlalu besar." });
    return;
  }
  await mkdir("public/uploads", { recursive: true });
  const filename = `${randomUUID()}.webp`;
  await sharp(output).toFile(`public/uploads/${filename}`);
  res.status(201).json({ url: `/uploads/${filename}` });
});
