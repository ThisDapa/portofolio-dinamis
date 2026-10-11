import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

if (!existsSync(".env")) {
  const password = randomBytes(18).toString("base64url");
  const secret = randomBytes(48).toString("hex");
  const template = readFileSync(".env.example", "utf8");
  const contents = template
    .replace("JWT_SECRET=", `JWT_SECRET=${secret}`)
    .replace("ADMIN_PASSWORD=", `ADMIN_PASSWORD=${password}`);

  writeFileSync(".env", contents, { mode: 0o600 });
  console.log("Created private .env. Read ADMIN_EMAIL and ADMIN_PASSWORD there to sign in.");
}
