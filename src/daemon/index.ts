/**
 * This is the entry point for the daemon
 * whose main purpose is to create or update the SQLite database
 * with content from the catalog folder
 */

/**
 * Build mode.
 *
 * In build mode, the SQLite database is deleted and recreated.
 */
async function build() {
  throw new Error("Not implemented");
}

/**
 * Watch mode
 *
 * In watch mode, the SQLite database is created if none exist.
 *
 * Chokidar is used to watch files in the catalog folder, to update the SQLite database
 */
async function watch() {}
