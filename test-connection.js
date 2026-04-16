require("dotenv/config");

const directUrl = process.env.DIRECT_URL;
const poolUrl = process.env.DATABASE_URL;

console.log("DIRECT_URL:", directUrl ? "✓ Loaded" : "✗ Not set");
console.log("DATABASE_URL:", poolUrl ? "✓ Loaded" : "✗ Not set");

if (directUrl) {
  const url = new URL(directUrl);
  console.log("\nDIRECT_URL Details:");
  console.log("  Host:", url.hostname);
  console.log("  Port:", url.port || 5432);
  console.log("  Database:", url.pathname);
}

if (poolUrl) {
  const url = new URL(poolUrl);
  console.log("\nDATABASE_URL Details:");
  console.log("  Host:", url.hostname);
  console.log("  Port:", url.port || 5432);
  console.log("  Database:", url.pathname);
}
