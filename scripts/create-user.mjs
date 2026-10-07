// Creates ONE login account (insert only; an existing username or email is left untouched) and prints its password once.
//   npm run user:create                -> username "demo"
//   npm run user:create -- <username>
// Uses DATABASE_URL from .env. Same password format as createPasswordHash in src/lib/auth.ts.
import crypto from "node:crypto";
import pg from "pg";

process.loadEnvFile(new URL("../.env", import.meta.url).pathname);

const username = (process.argv[2] ?? "demo").trim();
const password = crypto.randomBytes(18).toString("base64url");
const b64url = (buf) => buf.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
const salt = crypto.randomBytes(16);
const passwordHash = `scrypt$${b64url(salt)}$${b64url(crypto.scryptSync(password, salt, 64))}`;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
try {
  const r = await pool.query(
    `insert into public.people (user_id, username, email, first_name, last_name, password_hash)
     values ($1, $2, $3, 'Demo', 'User', $4) on conflict do nothing returning user_id`,
    [crypto.randomUUID(), username, `${username}@example.test`, passwordHash],
  );
  console.log(r.rowCount === 1 ? `created: username=${username} password=${password}` : `nothing changed: "${username}" already exists`);
} catch (err) {
  console.error("failed, nothing written:", err.code ?? err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
