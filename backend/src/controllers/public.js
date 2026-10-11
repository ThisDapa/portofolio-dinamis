import { db } from "../services/db.js";
import { contactSchema } from "../services/schemas.js";
export const portfolio = async (req, res) => {
  const [profile, projects, skills, testimonials, socials] = await Promise.all([
    db.profile.findUnique({ where: { id: 1 } }),
    db.project.findMany({
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
    }),
    db.skill.findMany({ orderBy: { sortOrder: "asc" } }),
    db.testimonial.findMany({ where: { status: "published" } }),
    db.social.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  res.json({ profile, projects, skills, testimonials, socials });
};
export const project = async (req, res) => {
  const item = await db.project.findUnique({
    where: { slug: String(req.params.slug) },
  });
  if (!item) {
    res.status(404).json({ error: "Karya tidak ditemukan." });
    return;
  }
  res.json(item);
};
export const contact = async (req, res) => {
  const input = contactSchema.parse(req.body);
  if (!input.website)
    await db.message.create({
      data: { name: input.name, email: input.email, message: input.message },
    });
  res.status(201).json({ message: "Terima kasih! Pesan Anda sudah diterima." });
};
