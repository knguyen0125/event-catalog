const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const _ = require('lodash');

function getFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  });
  return Array.prototype.concat(...files);
}

function getCatalogFolderHash() {
  const files = getFiles('./catalog');

  const hasher = crypto.createHash('md5');

  _.chain(files)
    .map((file) => fs.readFileSync(file))
    .forEach((fileContent) => hasher.update(fileContent))
    .value();

  return hasher.digest('hex');
}

function writeCatalogHash() {
  fs.writeFileSync(
    './catalogHash.json',
    JSON.stringify(getCatalogFolderHash()),
  );
}

module.exports = {
  getFiles,
  writeCatalogHash,
  getCatalogFolderHash,
};
