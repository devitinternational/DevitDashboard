/**
 * verify-ssot.js — Run from DevitDashboard root.
 *
 * Tests 4 things that must pass before going to prod:
 *  1. @devitinternational/db resolves correctly (not @prisma/client)
 *  2. Invoice model present — the one that was missing before SSOT fix
 *  3. All 16 core models accessible
 *  4. Live database connection (direct TCP via pg + PrismaPg)
 *
 * Usage: node verify-ssot.js
 */

require("dotenv/config");
const { PrismaClient } = require("@devitinternational/db");
// Use native pg — it's a direct dep of Dashboard and works in plain Node.js
// unlike @neondatabase/serverless which needs WebSocket/fetch polyfills
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const REQUIRED_MODELS = [
  "user", "account", "session", "verificationToken",
  "domain", "section", "lesson",
  "task", "quizQuestion", "quizOption",
  "enrollment", "submission", "certificate",
  "invoice", "expense", "income",
];

function createClient() {
  const connectionString =
    process.env.PROD_DIRECT_URL ||
    process.env.DEV_DIRECT_URL ||
    process.env.PROD_DATABASE_URL ||
    process.env.DEV_DATABASE_URL ||
    process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("No database URL found in .env");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

async function verify() {
  console.log("\n🔍 SSOT Verification — @devitinternational/db\n");
  let passed = 0;
  let failed = 0;

  // ─── TEST 1: Package resolves from @devitinternational, not @prisma/client ─
  console.log("TEST 1: Package resolution");
  try {
    const dbPath = require.resolve("@devitinternational/db");
    if (!dbPath.includes("devitinternational")) {
      throw new Error("Resolving from wrong package: " + dbPath);
    }
    console.log("  ✅ Resolves from @devitinternational/db");
    console.log("    ", dbPath.split("node_modules")[1]);
    passed++;
  } catch (err) {
    console.log("  ❌ FAILED:", err.message);
    failed++;
  }

  // ─── TEST 2: Invoice model present (was missing before SSOT) ──────────────
  console.log("\nTEST 2: Invoice model in shared package");
  try {
    const client = createClient();
    if (typeof client.invoice === "undefined") {
      throw new Error("client.invoice is undefined — Invoice not in schema");
    }
    console.log("  ✅ Invoice model accessible from @devitinternational/db");
    await client.$disconnect();
    passed++;
  } catch (err) {
    console.log("  ❌ FAILED:", err.message);
    failed++;
  }

  // ─── TEST 3: All core models present ──────────────────────────────────────
  console.log("\nTEST 3: All core models accessible");
  try {
    const client = createClient();
    const missing = REQUIRED_MODELS.filter(m => typeof client[m] === "undefined");
    if (missing.length > 0) {
      throw new Error(`Missing models: ${missing.join(", ")}`);
    }
    console.log(`  ✅ All ${REQUIRED_MODELS.length} models present`);
    console.log("    ", REQUIRED_MODELS.join(", "));
    await client.$disconnect();
    passed++;
  } catch (err) {
    console.log("  ❌ FAILED:", err.message);
    failed++;
  }

  // ─── TEST 4: Live database connection ─────────────────────────────────────
  console.log("\nTEST 4: Live database connection");
  try {
    const client = createClient();

    await client.$queryRaw`SELECT 1 AS ping`;
    console.log("  ✅ Connected to database");

    const userCount = await client.user.count();
    console.log(`  ✅ user table — ${userCount} rows`);

    // Invoice table — the one that was missing before SSOT fix
    const invoiceCount = await client.invoice.count();
    console.log(`  ✅ invoice table — ${invoiceCount} rows`);

    const enrollmentCount = await client.enrollment.count();
    console.log(`  ✅ enrollment table — ${enrollmentCount} rows`);

    await client.$disconnect();
    passed++;
  } catch (err) {
    console.log("  ❌ FAILED:", err.message);
    if (err.cause) console.log("     Cause:", err.cause.message);
    failed++;
  }

  // ─── SUMMARY ───────────────────────────────────────────────────────────────
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  if (failed === 0) {
    console.log(`✅ ${passed}/${passed + failed} checks passed`);
    console.log("🟢 ALL CHECKS PASSED — Safe to push to prod\n");
  } else {
    console.log(`❌ ${failed} check(s) failed, ${passed} passed`);
    console.log("🔴 FIX FAILURES BEFORE PUSHING TO PROD\n");
    process.exit(1);
  }
}

verify().catch(err => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
