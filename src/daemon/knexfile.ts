export default {
  client: "better-sqlite3",
  connection: {
    filename: process.env.DB_PATH as string,
  },
  migrations: {
    loadExtensions: [".ts"],
    extension: "ts",
  },
  useNullAsDefault: true,
};
