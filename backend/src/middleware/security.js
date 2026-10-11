import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import multer from "multer";
import { config } from "../config.js";
import { db } from "../services/db.js";
export const cookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api",
  maxAge: 8 * 60 * 60 * 1000,
};
export const checkOrigin = (req, res, next) => {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.get("origin") !== config.FRONTEND_URL
  ) {
    res.status(403).json({ error: "Origin tidak diizinkan." });
    return;
  }
  next();
};
export const requireAdmin = async (req, res, next) => {
  try {
    const payload = jwt.verify(req.cookies.session ?? "", config.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "portfolio-api",
      audience: "portfolio-admin",
    });
    if (
      typeof payload === "string" ||
      !payload.sub ||
      !(await db.admin.findUnique({ where: { id: payload.sub } }))
    ) {
      res.status(401).json({ error: "Silakan login." });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: "Sesi berakhir. Silakan login." });
  }
};
export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({
      error: error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(" "),
    });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    res
      .status(error.code === "P2025" ? 404 : error.code === "P2002" ? 409 : 500)
      .json({
        error:
          error.code === "P2002"
            ? "Slug sudah dipakai."
            : error.code === "P2025"
              ? "Data tidak ditemukan."
              : "Operasi database gagal.",
      });
    return;
  }
  if (error instanceof multer.MulterError) {
    res
      .status(400)
      .json({ error: "Upload tidak valid. Maksimal 5 MB, satu gambar." });
    return;
  }
  if (error instanceof Error && "status" in error && error.status === 413) {
    res.status(413).json({ error: "Isi permintaan terlalu besar." });
    return;
  }
  if (error instanceof SyntaxError) {
    res.status(400).json({ error: "JSON tidak valid." });
    return;
  }
  console.error(
    "Request failed",
    req.method,
    req.path,
    error instanceof Error ? error.message : "Unknown error",
  );
  res.status(500).json({ error: "Permintaan gagal. Coba lagi." });
};
