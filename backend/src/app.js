import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { config } from "./config.js";
import {
  checkOrigin,
  requireAdmin,
  errorHandler,
} from "./middleware/security.js";
import { login, logout } from "./controllers/auth.js";
import { portfolio, project, contact } from "./controllers/public.js";
import { adminRouter } from "./routes/admin.js";
export const app = express();
app.set("trust proxy", config.TRUST_PROXY);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "100kb" }), cookieParser(), checkOrigin);
app.use(
  "/uploads",
  express.static("public/uploads", { maxAge: "1d", dotfiles: "deny" }),
);
app.get("/api/portfolio", portfolio);
app.get("/api/projects/:slug", project);
app.post(
  "/api/contact",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Terlalu banyak pesan. Coba lagi dalam 15 menit." },
  }),
  contact,
);
app.post(
  "/api/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." },
  }),
  login,
);
app.post("/api/auth/logout", logout);
app.get("/api/auth/me", requireAdmin, (req, res) => {
  res.json({ authenticated: true });
});
app.use("/api/admin", requireAdmin, adminRouter);
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan." });
});
app.use(errorHandler);
