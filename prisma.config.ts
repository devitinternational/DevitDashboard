require("dotenv/config");

module.exports = {
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
require("dotenv/config");

module.exports = {
  schema: "prisma/schema.prisma",
  seed: "tsx prisma/seed.ts",
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
