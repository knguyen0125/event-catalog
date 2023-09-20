const { buildDatabase, dropEverything } = require('./database');

dropEverything()
  .then(() => buildDatabase())
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
