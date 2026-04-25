import "dotenv/config";
import { Client } from "pg";

const isDev = process.env.IS_DEV === "true";
const connectionString = isDev
  ? process.env.DEV_DIRECT_URL || process.env.DEV_DATABASE_URL
  : process.env.PROD_DIRECT_URL || process.env.PROD_DATABASE_URL;

if (!connectionString) {
  throw new Error("Database URL not configured");
}

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Neon
  });

  try {
    await client.connect();
    console.log("✓ Connected to database");

    // Create a test user
    await client.query(`
      INSERT INTO "User" (id, name, email, "role", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'Test User',
        'test@example.com',
        'ADMIN',
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO NOTHING
    `);

    console.log("✓ User seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await client.end();
  }
}

main()
  .then(() => {
    console.log("Seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });