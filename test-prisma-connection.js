require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");

async function testConnection() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

  console.log("Testing connection to:", connectionString.split("@")[1].split("/")[0]);
  console.log("Using adapter: PrismaNeon");
  console.log("");

  try {
    const prisma = new PrismaClient({
      adapter: new PrismaNeon({ connectionString }),
      log: ["info", "warn", "error"],
    });

    console.log("Attempting query...");
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✓ Connection successful!");
    console.log("Query result:", result);
    await prisma.$disconnect();
  } catch (error) {
    console.error("✗ Connection failed:");
    console.error("  Error:", error.message);
    if (error.cause) {
      console.error("  Cause:", error.cause.message);
    }
  }
}

testConnection();
