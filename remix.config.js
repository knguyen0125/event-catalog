/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ['**/.*'],
  appDirectory: 'src/app',
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  serverModuleFormat: 'esm',
  future: {
    v2_dev: true,
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
  watchPaths: [],
  tailwind: true,
  serverDependenciesToBundle: [
    /^react-markdown.*/,
    /^remark.*/,
    /^unified.*/,
    /^rehype.*/,
    /^vfile.*/,
    'property-information',
    /^hast.*/,
    /^unist.*/,
    /^mdast.*/,
    /^micromark.*/,
    'space-separated-tokens',
    'comma-separated-tokens',
    'bail',
    'is-plain-obj',
    'trough',
    'trim-lines',
    'decode-named-character-reference',
    'character-entities',
  ],
};
