const isDev = process.env.IS_DEV === "true";
const databaseUrl = isDev
  ? process.env.DEV_DATABASE_URL
  : process.env.PROD_DATABASE_URL;

module.exports = {
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
};
