// Fills a DEMO database with fictional data. Run it through scripts/with-demo-db.mjs (`npm run db:demo:seed`),
// which points DATABASE_URL at DEMO_DATABASE_URL and refuses a URL that is the real database.
//
// It empties the app tables first, so it also refuses when the database holds any account other than `demo`.
import crypto from "node:crypto";
import pg from "pg";

if (process.env.DEMO_MODE !== "1") {
  console.error("DEMO_MODE=1 is required (run this through `npm run db:demo:seed`)");
  process.exit(1);
}

const b64url = (buf) => buf.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");

// Same format as createPasswordHash in src/lib/auth.ts. The password is random and thrown away: the demo
// account signs in through the one-click button.
function unusablePasswordHash() {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(crypto.randomBytes(32).toString("hex"), salt, 64);
  return `scrypt$${b64url(salt)}$${b64url(key)}`;
}

const reports = [
  {
    title: "Roof inspection: Example House, 12 Sample Lane",
    prompt: "Inspect the roof photos and list anything that needs repair.",
    images: ["roof-north.jpg", "roof-south.jpg", "gutter-close-up.jpg"],
    summary:
      "The roof is in fair condition overall. Several shingles on the north slope are lifting and the gutter at the east corner is detached; neither is an emergency, but both should be fixed before the rainy season.",
    findings: [
      {
        area: "North slope",
        observation: "About a dozen shingles are curled at the edges and two are cracked.",
        implication: "Wind-driven rain can get under the shingles and reach the decking.",
        recommendation: "Replace the cracked shingles and re-seal the curled ones within 3 months.",
      },
      {
        area: "East gutter",
        observation: "The gutter has pulled away from the fascia over a span of roughly 1.5 m.",
        implication: "Water runs down the wall and can stain or rot the fascia board.",
        recommendation: "Re-fix the gutter with new brackets and check the downpipe is clear.",
      },
      {
        area: "Flashing around the chimney",
        observation: "Flashing is intact with minor surface rust.",
        implication: "No leak risk today; rust may spread over a few years.",
        recommendation: "Clean and repaint at the next scheduled maintenance.",
      },
    ],
  },
  {
    title: "Warehouse roof survey: Demo Logistics Park, Unit 4",
    prompt: "Survey the roof sheets and skylights for corrosion and leaks.",
    images: ["unit4-overview.jpg", "skylight-3.jpg"],
    summary:
      "Metal sheeting is serviceable with localised corrosion near the drainage valley. One skylight seal has failed and is the likely source of the reported leak.",
    findings: [
      {
        area: "Drainage valley",
        observation: "Surface corrosion along about 8 m of the valley, with two small perforations.",
        implication: "Standing water accelerates corrosion and the perforations will leak in heavy rain.",
        recommendation: "Patch the perforations now and plan to replace the valley liner this year.",
      },
      {
        area: "Skylight 3",
        observation: "The perimeter sealant has split on the upslope side.",
        implication: "Water enters at the seal; this matches the stain seen on the ceiling below.",
        recommendation: "Remove the old sealant and re-seal; inspect the other skylights for the same age-related split.",
      },
    ],
  },
  {
    title: "Post-storm check: Sample Villa, Phase 2",
    prompt: "Check for storm damage and rate urgency.",
    images: ["villa-front.jpg", "villa-ridge.jpg", "villa-tiles.jpg", "villa-yard.jpg"],
    summary:
      "Minor storm damage: displaced ridge tiles and some debris on the lower roof. No structural issues were visible in the photos.",
    findings: [
      {
        area: "Ridge",
        observation: "Three ridge tiles have shifted and one is missing.",
        implication: "The ridge line is exposed; rain can enter along the gap.",
        recommendation: "Re-bed the shifted tiles and replace the missing one as soon as practical.",
      },
      {
        area: "Lower roof",
        observation: "Branches and leaves are lying in the valley.",
        implication: "Debris can block drainage and cause overflow.",
        recommendation: "Clear the debris and check the valley for damage.",
      },
    ],
  },
];

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const client = await pool.connect();

try {
  await client.query("begin");

  // Count every account, including the ones sign-up creates without a username.
  const { rows } = await client.query(`select count(*)::int as n from people where username is distinct from 'demo'`);
  if (rows[0].n > 0) {
    throw new Error(
      `refusing to seed: this database has ${rows[0].n} non-demo account(s). The demo seed empties the app tables and must only run against a dedicated demo database.`,
    );
  }

  await client.query(`truncate table sessions, subscriptions, "Image", "Report", ai_models, people restart identity cascade`);

  await client.query(
    `insert into people (user_id, username, email, first_name, last_name, password_hash) values ($1, 'demo', 'demo@example.test', 'Demo', 'User', $2)`,
    [crypto.randomUUID(), unusablePasswordHash()],
  );

  const day = 86_400_000;
  for (const [i, r] of reports.entries()) {
    const id = crypto.randomUUID().replaceAll("-", "").slice(0, 25);
    await client.query(`insert into "Report" (id, title, prompt, findings, "createdAt") values ($1, $2, $3, $4, $5)`, [
      id,
      r.title,
      r.prompt,
      JSON.stringify({ summary: r.summary, findings: r.findings }),
      new Date(Date.now() - (i * 6 + 1) * day),
    ]);
    for (const [j, filename] of r.images.entries()) {
      await client.query(`insert into "Image" (id, "reportId", filename, "mimeType", size) values ($1, $2, $3, 'image/jpeg', $4)`, [
        crypto.randomUUID().replaceAll("-", "").slice(0, 25),
        id,
        filename,
        180_000 + j * 37_000,
      ]);
    }
  }

  await client.query("commit");
  console.log(`demo data ready: 1 demo account, ${reports.length} reports`);
} catch (err) {
  await client.query("rollback").catch(() => {});
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
