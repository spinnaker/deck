/* eslint-disable no-console */

const { execSync } = require('child_process');
const { assertJsonFile } = require('../asserters/assertJsonFile');
const { readJson, writeJson } = require('../util/readWriteJson');

function getLatestSdkVersion() {
  const versionsString = execSync('npm info @spinnaker/pluginsdk versions').toString();
  return JSON.parse(versionsString.replace(/'/g, '"')).pop();
}

function checkPackageJson(report) {
  const pkgJson = readJson('package.json');
  const deps = pkgJson.dependencies || {};
  const sdk = deps['@spinnaker/pluginsdk'];
  const latest = getLatestSdkVersion();

  report(`This plugin uses an out of date @spinnaker/pluginsdk@${sdk}`, sdk === latest, {
    description: `Install @spinnaker/pluginsdk@${latest}`,
    command: `yarn add @spinnaker/pluginsdk@${latest}`,
  });

  const checkPackageJsonField = assertJsonFile(report, 'package.json', pkgJson);

  checkPackageJsonField('module', 'build/dist/index.js');
  checkPackageJsonField('scripts.clean', 'npx shx rm -rf build');
  checkPackageJsonField('scripts.develop', 'run-p watch proxy');
  checkPackageJsonField('scripts.build', 'npm run clean && rollup -c');
  checkPackageJsonField('scripts.postinstall', 'check-plugin && check-peer-dependencies || true');
  checkPackageJsonField('scripts.proxy', 'dev-proxy');
  checkPackageJsonField('scripts.watch', 'rollup -c -w --no-watch.clearScreen');

  const bundlesFiles = pkgJson.files && pkgJson.files.includes('build/dist');
  const bundlesFilesFixer = () => {
    const json = readJson('package.json');
    if (!json.files) {
      json.files = [];
    }
    json.files.push('build/dist');
    writeJson('package.json', json);

    console.log(`fixed: added "build/dist" to "files" in package.json`);
  };
  report('package.json: files does not include "build/dist"', bundlesFiles, {
    description: 'Add "build/dist" to files array in package.json',
    fixer: bundlesFilesFixer,
  });
}

module.exports = { checkPackageJson };
