import * as fs from 'node:fs';
import * as path from 'node:path';

import { createRequestHandler } from '@remix-run/express';
import { broadcastDevReady, installGlobals } from '@remix-run/node';
import chokidar from 'chokidar';
import express from 'express';
import morgan from 'morgan';
import async from 'async';

installGlobals();

const BUILD_PATH = './build/index.js';
/**
 * @type { import('@remix-run/node').ServerBuild | Promise<import('@remix-run/node').ServerBuild> }
 */
let build = await import(BUILD_PATH);

const app = express();

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by');

// Remix fingerprints its assets so we can cache forever.
app.use(
  '/build',
  express.static('public/build', { immutable: true, maxAge: '1y' }),
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('public', { maxAge: '1h' }));

app.use(morgan('tiny'));

app.all(
  '*',
  process.env.NODE_ENV === 'development'
    ? createDevRequestHandler()
    : createProdRequestHandler(),
);

const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`Express server listening on port ${port}`);

  if (process.env.NODE_ENV === 'development') {
    broadcastDevReady(build);
  }
});

function createDevRequestHandler() {
  const watcher = chokidar.watch(BUILD_PATH, { ignoreInitial: true });

  watcher.on('all', async (event, path, stats) => {
    // 1. purge require cache && load updated server build
    build = import(path + '?t=' + stats.mtimeMs);
    // 2. tell dev server that this app server is now ready
    broadcastDevReady(await build);
  });

  const catalogWatcher = chokidar.watch('./catalog', { ignoreInitial: true });
  const eventQueue = async.queue(async ({ event, path, stats }) => {
    // Build database
    await buildDatabase();

    const stat = fs.statSync(BUILD_PATH);
    build = import(BUILD_PATH + '?t=' + stat.mtimeMs);

    broadcastDevReady(await build);
  }, 1);

  catalogWatcher.on('all', async (event, path, stats) => {
    eventQueue.push({ event, path, stats });
  });

  return async (req, res, next) => {
    try {
      // Build database
      await buildDatabase();

      return createRequestHandler({
        build: await build,
        mode: 'development',
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function createProdRequestHandler() {
  return async (req, res, next) => {
    try {
      // Build database
      await buildDatabase();

      return createRequestHandler({
        build: await build,
        mode: 'production',
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function getFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  });
  return Array.prototype.concat(...files);
}

async function buildDatabase() {
  // Recursively read all files in the catalog directory
  const files = getFiles('./catalog');
  // Truncate file to get rid of current directory path
  const truncatedFiles = files.map((file) => {
    return file.replace(path.resolve(process.cwd(), 'catalog'), '');
  });

  const regexes = {
    event: /^\/events\/(?<event_name>[^\/]+?)$/,
    domainEvent:
      /^\/domains\/(?<domain_name>[^\/]+?)\/events\/(?<event_name>[^\/]+?)$/,
    service: /^\/events\/(?<event_name>[^\/]+?)$/,
    domainService:
      /^\/domains\/(?<domain_name>[^\/]+?)\/services\/(?<service_name>[^\/]+?)$/,
    domain: /^\/domains\/(?<domain_name>[^\/]+?)$/,
    owner: /^\/owners\/(?<owner_email>[^\/]+?)$/,
  };

  const eventFiles = truncatedFiles.filter((file) => {
    const dir = path.dirname(file);

    return regexes.event.test(dir) || regexes.domainEvent.test(dir);
  });

  console.log(eventFiles);
}

buildDatabase();
