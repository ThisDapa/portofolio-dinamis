import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import request from "supertest";
import sharp from "sharp";
const database = `test-${randomUUID()}.db`;
process.env.DATABASE_URL = `file:./${database}`;
process.env.NODE_ENV = "test";
execFileSync(
  "node",
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  { env: process.env, stdio: "pipe" },
);
execFileSync("node", ["prisma/seed.js"], {
  env: process.env,
  stdio: "pipe",
});
const { app } = await import("../src/app.js");
const { db } = await import("../src/services/db.js");
const origin = process.env.FRONTEND_URL;
const agent = request.agent(app);
await test("API security and content lifecycle", async (context) => {
  let projectId = "";
  let messageId = "";
  let uploadPath = "";
  try {
    await context.test("private routes require session", async () => {
      await request(app).get("/api/admin/projects").expect(401);
    });
    await context.test("mutations reject untrusted Origin", async () => {
      await request(app).post("/api/auth/login").send({}).expect(403);
    });
    await context.test("login rejects invalid credentials", async () => {
      await agent
        .post("/api/auth/login")
        .set("Origin", origin)
        .send({ email: process.env.ADMIN_EMAIL, password: "incorrect" })
        .expect(401);
    });
    await context.test(
      "login issues HttpOnly SameSite cookie",
      async () => {
        const res = await agent
          .post("/api/auth/login")
          .set("Origin", origin)
          .send({
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
          })
          .expect(200);
        assert.match(String(res.headers["set-cookie"]), /HttpOnly/);
        assert.match(String(res.headers["set-cookie"]), /SameSite=Strict/);
      },
    );
    await context.test(
      "draft testimonials never appear publicly",
      async () => {
        const res = await request(app).get("/api/portfolio").expect(200);
        assert.equal(res.body.testimonials.length, 0);
        assert.equal(res.body.projects.length, 2);
      },
    );
    const project = {
      slug: "uji-proyek",
      title: "Uji proyek",
      description: "Deskripsi untuk uji integrasi.",
      content: "Studi kasus pengujian.",
      imageUrl: "/samples/warung-harian.svg",
      imageAlt: "Ilustrasi uji",
      techStack: ["JavaScript"],
      demoUrl: "",
      repoUrl: "",
      featured: false,
      sortOrder: 0,
    };
    await context.test("project lifecycle and unique slug", async () => {
      const created = await agent
        .post("/api/admin/projects")
        .set("Origin", origin)
        .send(project)
        .expect(201);
      projectId = created.body.id;
      await agent
        .post("/api/admin/projects")
        .set("Origin", origin)
        .send(project)
        .expect(409);
      await agent
        .put(`/api/admin/projects/${projectId}`)
        .set("Origin", origin)
        .send({ ...project, title: "Judul diperbarui" })
        .expect(200);
      const res = await request(app)
        .get("/api/projects/uji-proyek")
        .expect(200);
      assert.equal(res.body.title, "Judul diperbarui");
    });
    await context.test("unsafe URLs and HTML are rejected", async () => {
      await agent
        .post("/api/admin/projects")
        .set("Origin", origin)
        .send({ ...project, slug: "unsafe", demoUrl: "javascript:alert(1)" })
        .expect(400);
      await agent
        .post("/api/admin/skills")
        .set("Origin", origin)
        .send({
          name: "<script>",
          category: "Test",
          context: "Test",
          sortOrder: 0,
        })
        .expect(400);
    });
    await context.test("skill, social, testimonial CRUD", async () => {
      for (const [entity, data] of Object.entries({
        skills: {
          name: "SQL",
          category: "Backend",
          context: "Transaksi konsisten.",
          sortOrder: 0,
        },
        socials: {
          label: "Dokumentasi",
          url: "https://example.org",
          sortOrder: 0,
        },
        testimonials: {
          name: "Kutipan uji",
          relation: "Pengujian",
          quote: "Kutipan untuk pengujian API.",
          photoUrl: "",
          status: "draft",
        },
      })) {
        const created = await agent
          .post(`/api/admin/${entity}`)
          .set("Origin", origin)
          .send(data)
          .expect(201);
        await agent.get(`/api/admin/${entity}`).expect(200);
        await agent
          .put(`/api/admin/${entity}/${created.body.id}`)
          .set("Origin", origin)
          .send(
            entity === "testimonials" ? { ...data, status: "published" } : data,
          )
          .expect(200);
        if (entity === "testimonials") {
          const res = await request(app).get("/api/portfolio").expect(200);
          assert.equal(res.body.testimonials.length, 1);
        }
        await agent
          .delete(`/api/admin/${entity}/${created.body.id}`)
          .set("Origin", origin)
          .expect(204);
      }
    });
    await context.test(
      "profile changes persist and seed preserves edits",
      async () => {
        const current = await agent.get("/api/admin/profile").expect(200);
        await agent
          .put("/api/admin/profile")
          .set("Origin", origin)
          .send({ ...current.body, name: "Profil diperbarui" })
          .expect(200);
        execFileSync("node", ["prisma/seed.js"], {
          env: process.env,
          stdio: "pipe",
        });
        const res = await request(app).get("/api/portfolio");
        assert.equal(res.body.profile.name, "Profil diperbarui");
      },
    );
    await context.test("contact validation and honeypot", async () => {
      await request(app)
        .post("/api/contact")
        .set("Origin", origin)
        .send({ name: "Pengunjung", email: "invalid", message: "pendek" })
        .expect(400);
      await request(app)
        .post("/api/contact")
        .set("Origin", origin)
        .send({
          name: "Bot",
          email: "bot@example.test",
          message: "Ini pesan bot untuk tes spam.",
          website: "https://spam.test",
        })
        .expect(201);
      assert.equal(await db.message.count(), 0);
    });
    await context.test("contact inbox read and delete", async () => {
      await request(app)
        .post("/api/contact")
        .set("Origin", origin)
        .send({
          name: "Pengunjung",
          email: "visitor@example.test",
          message: "Saya ingin membahas aplikasi inventaris.",
          website: "",
        })
        .expect(201);
      const inbox = await agent.get("/api/admin/messages").expect(200);
      messageId = inbox.body[0].id;
      const read = await agent
        .patch(`/api/admin/messages/${messageId}`)
        .set("Origin", origin)
        .send({ read: true })
        .expect(200);
      assert.ok(read.body.readAt);
      await agent
        .delete(`/api/admin/messages/${messageId}`)
        .set("Origin", origin)
        .expect(204);
    });
    await context.test(
      "uploads reject disguised files and accept raster",
      async () => {
        await agent
          .post("/api/admin/uploads")
          .set("Origin", origin)
          .attach("image", Buffer.from("<svg/>"), {
            filename: "fake.png",
            contentType: "image/png",
          })
          .expect(400);
        await agent
          .post("/api/admin/uploads")
          .set("Origin", origin)
          .attach("image", Buffer.alloc(5 * 1024 * 1024 + 1), {
            filename: "large.png",
            contentType: "image/png",
          })
          .expect(400);
        const buffer = await sharp({
          create: { width: 8, height: 8, channels: 3, background: "#fff" },
        })
          .png()
          .toBuffer();
        const res = await agent
          .post("/api/admin/uploads")
          .set("Origin", origin)
          .attach("image", buffer, {
            filename: "valid.png",
            contentType: "image/png",
          })
          .expect(201);
        assert.match(res.body.url, /^\/uploads\/.*\.webp$/);
        uploadPath = `public${res.body.url}`;
      },
    );
    await context.test("deletion and missing project", async () => {
      await agent
        .delete(`/api/admin/projects/${projectId}`)
        .set("Origin", origin)
        .expect(204);
      await request(app).get("/api/projects/uji-proyek").expect(404);
    });
    await context.test("contact rate limit", async () => {
      for (let i = 0; i < 3; i++)
        await request(app).post("/api/contact").set("Origin", origin).send({});
      await request(app)
        .post("/api/contact")
        .set("Origin", origin)
        .send({})
        .expect(429);
    });
    await context.test("logout removes session", async () => {
      await agent.post("/api/auth/logout").set("Origin", origin).expect(200);
      await agent.get("/api/auth/me").expect(401);
    });
    await context.test("login rate limit", async () => {
      for (let i = 0; i < 8; i++)
        await request(app)
          .post("/api/auth/login")
          .set("Origin", origin)
          .send({});
      await request(app)
        .post("/api/auth/login")
        .set("Origin", origin)
        .send({})
        .expect(429);
    });
  } finally {
    await db.$disconnect();
    await unlink(`prisma/${database}`);
    if (uploadPath) await unlink(uploadPath);
  }
});
