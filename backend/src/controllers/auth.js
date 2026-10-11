import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { db } from "../services/db.js";
import { loginSchema } from "../services/schemas.js";
import { cookieOptions } from "../middleware/security.js";
const dummyHash = bcrypt.hashSync("non-user-timing-padding", 12);
export const login = async (req, res) => {
  const input = loginSchema.parse(req.body);
  const admin = await db.admin.findUnique({ where: { email: input.email } });
  const valid = await bcrypt.compare(
    input.password,
    admin?.passwordHash ?? dummyHash,
  );
  if (!admin || !valid) {
    res.status(401).json({ error: "Email atau kata sandi salah." });
    return;
  }
  const token = jwt.sign({}, config.JWT_SECRET, {
    algorithm: "HS256",
    subject: admin.id,
    expiresIn: "8h",
    issuer: "portfolio-api",
    audience: "portfolio-admin",
  });
  res.cookie("session", token, cookieOptions).json({ email: admin.email });
};
export const logout = (req, res) => {
  res.clearCookie("session", cookieOptions).json({ ok: true });
};
