const path = require('node:path')
const fs = require('node:fs')
const { createRequestHandler } = require('@remix-run/express');
const { broadcastDevReady, installGlobals } = require('@remix-run/node');
const chokidar = require('chokidar');
const express = require('express');
const morgan = require('morgan');
const async = require('async');
const {buildDatabase} = require("./database.js");

installGlobals();

const BUILD_PATH = path.resolve('./build/index.js');
/**
 * @type { import('@remix-run/node').ServerBuild | Promise<import('@remix-run/node').ServerBuild> }
 */
let build = require(BUILD_PATH);
const {dropEverything} = require("./database");

const reimportServer = () => {
  Object.keys(require.cache).forEach((key) => {
    if (key.startsWith(BUILD_PATH)) {
      delete require.cache[key];
    }
  })

  return require(BUILD_PATH)
}

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
dropEverything().then(() => buildDatabase()).then(() => app.listen(port, async () => {
  console.log(`Express server listening on port ${port}`);

  if (process.env.NODE_ENV === 'development') {
    broadcastDevReady(build);
  }
}));

function createDevRequestHandler() {
  const watcher = chokidar.watch(BUILD_PATH, { ignoreInitial: true });

  watcher.on('all', async (event, path, stats) => {
    // 1. purge require cache && load updated server build
    build = await reimportServer()
    // 2. tell dev server that this app server is now ready
    broadcastDevReady(await build);
  });

  const catalogWatcher = chokidar.watch('./catalog', { ignoreInitial: true });
  const eventQueue = async.queue(async ({ event, path, stats }, callback) => {
    try {
      // Build database
      console.log('Updating db');
      await buildDatabase();

      build = await reimportServer()

      console.log("Rebuilding")
      await broadcastDevReady(await build).then();
      callback();
    } catch (e) {
      callback(e)
    }
  }, 1);

  catalogWatcher.on('all', async (event, path, stats) => {
    console.log(event)
    console.log(eventQueue);
    //
    eventQueue.push({ event, path, stats });
  });
  eventQueue.drain()

  return async (req, res, next) => {
    try {
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
