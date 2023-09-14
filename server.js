const path = require('node:path');
const _ = require('lodash');
const { createRequestHandler } = require('@remix-run/express');
const { broadcastDevReady, installGlobals } = require('@remix-run/node');
const chokidar = require('chokidar');
const express = require('express');
const morgan = require('morgan');
const { buildDatabase, dropEverything } = require('./database');

installGlobals();

const BUILD_PATH = path.resolve('./build/index.js');
/**
 * @type { import('@remix-run/node').ServerBuild | Promise<import('@remix-run/node').ServerBuild> }
 */
// eslint-disable-next-line import/no-dynamic-require
let build = require(BUILD_PATH);

const reimportServer = () => {
  Object.keys(require.cache).forEach((key) => {
    if (key.startsWith(BUILD_PATH)) {
      delete require.cache[key];
    }
  });

  // eslint-disable-next-line global-require,import/no-dynamic-require
  return require(BUILD_PATH);
};

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
    ? // eslint-disable-next-line no-use-before-define
      createDevRequestHandler()
    : // eslint-disable-next-line no-use-before-define
      createProdRequestHandler(),
);

const port = process.env.PORT || 3000;
dropEverything()
  .then(() => buildDatabase())
  .then(() =>
    app.listen(port, async () => {
      console.log(`Express server listening on port ${port}`);

      if (process.env.NODE_ENV === 'development') {
        broadcastDevReady(build);
      }
    }),
  );

function createDevRequestHandler() {
  const watcher = chokidar.watch(BUILD_PATH, { ignoreInitial: true });

  watcher.on('all', async () => {
    // 1. purge require cache && load updated server build
    build = await reimportServer();
    // 2. tell dev server that this app server is now ready
    broadcastDevReady(await build);
  });

  const catalogWatcher = chokidar.watch('./catalog', { ignoreInitial: true });

  const func = async () => {
    try {
      // Build database
      console.log('Updating db');
      await buildDatabase();

      build = await reimportServer();

      console.log('Rebuilding');
      await broadcastDevReady(await build).catch(() => {});
    } catch (e) {
      console.log(e);
    }
  };
  const debouncedFunc = _.debounce(func, 200);

  catalogWatcher.on('all', async (e) => {
    debouncedFunc();
  });

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
