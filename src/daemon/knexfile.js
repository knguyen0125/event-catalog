export default {
  client: 'better-sqlite3',
  connection: {
    filename: process.env.DB_PATH,
  },
  migrations: {
    // loadExtensions: ['.ts', '.js'],
    // extension: 'js'
  },
  useNullAsDefault: true,
};
