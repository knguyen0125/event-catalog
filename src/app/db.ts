import Knex from "knex";

const db = Knex({
  client: "better-sqlite3",
  connection: {
    filename: process.env.DB_PATH as string,
    options: {
      readonly: true,
    },
  },
});

export default db;
