// Runs a command against the DEMO database only (DATABASE_URL forced to DEMO_DATABASE_URL, DIRECT_URL cleared,
// DEMO_MODE=1). The demo seed wipes the app schema, so this refuses any URL that points at the same database
// as DATABASE_URL / DIRECT_URL in .env. It never prints a connection string.
//   node scripts/with-demo-db.mjs <command> [args...]
import { spawnSync } from "node:child_process";

process.loadEnvFile(new URL("../.env", import.meta.url).pathname);

const demo = process.env.DEMO_DATABASE_URL;
if (!demo) {
  console.error("DEMO_DATABASE_URL is not set in .env (a dedicated database, never the real one)");
  process.exit(1);
}

// Tolerant parse: passwords in these URLs are sometimes not URL-encoded, so split on the last "@".
function identify(url) {
  const m = /^[a-z]+:\/\/(.*)@([^@/]+)\/([^?]*)/i.exec(url);
  if (!m) return null;
  const [, userinfo, hostport, db] = m;
  const user = userinfo.split(":")[0];
  const host = hostport.replace(/:\d+$/, "").toLowerCase();
  const ids = new Set([`host:${hostport.toLowerCase()}/${db}`]);
  // Supabase: the project ref is in the pooler user ("postgres.<ref>") or the direct host ("db.<ref>.supabase.co")
  const ref = user.includes(".") ? user.split(".")[1] : /^db\.([a-z0-9]+)\.supabase\.co$/.exec(host)?.[1];
  if (ref) ids.add(`ref:${ref}/${db}`);
  return ids;
}

const demoIds = identify(demo);
if (!demoIds) {
  console.error("DEMO_DATABASE_URL is not a postgres connection string");
  process.exit(1);
}
for (const name of ["DATABASE_URL", "DIRECT_URL"]) {
  const other = process.env[name] && identify(process.env[name]);
  if (other && [...demoIds].some((id) => other.has(id))) {
    console.error(`DEMO_DATABASE_URL points at the same database as ${name}. Refusing: the demo seed wipes tables.`);
    process.exit(1);
  }
}

const env = { ...process.env, DATABASE_URL: demo, DEMO_MODE: "1" };
delete env.DIRECT_URL;

const [cmd, ...args] = process.argv.slice(2);
const result = spawnSync(cmd, args, { stdio: "inherit", env, shell: false });
process.exit(result.status ?? 1);
