#!/usr/bin/env node

// Rebuilds the `references` array in tsconfig.json files based on the project workspace

const process = require('child_process');
const path = require('path');
const fs = require('fs');
const prettier = require('prettier');
const { readJson, writeJson } = require('./read-write-json');

const root = path.resolve(__dirname, '..', '..');

const ignores = ['@spinnaker/eslint-plugin', '@spinnaker/scripts', '@spinnaker/pluginsdk'];

const workspaceMeta = JSON.parse(process.execSync('yarn --silent workspaces info --json').toString());
const packageNames = Object.keys(workspaceMeta).filter((x) => !ignores.includes(x));

const packageMeta = packageNames.map((name) => {
  const meta = workspaceMeta[name];
  const dir = path.resolve(root, meta.location);
  const tsconfig = path.resolve(dir, 'tsconfig.json');
  const deps = meta.workspaceDependencies.filter((x) => !ignores.includes(x));
  return { name, dir, tsconfig, deps };
});

async function formatTsconfig(file) {
  const absPath = path.resolve(file);
  const config = await prettier.resolveConfig(absPath);
  const source = fs.readFileSync(absPath, 'utf-8').replace(/{\n[ ]+"path": /gm, '{ "path": ');
  const formatted = await prettier.format(source, { ...config, filepath: absPath });
  fs.writeFileSync(absPath, formatted);
}

packageMeta.forEach(async (meta) => {
  if (!fs.existsSync(meta.tsconfig)) {
    console.error(`not found: ${meta.tsconfig}`);
    return;
  }

  const tsconfig = readJson(meta.tsconfig);
  tsconfig.references = tsconfig.references || [];
  tsconfig.compilerOptions = tsconfig.compilerOptions || {};
  tsconfig.compilerOptions.composite = true;

  const relativePathToPackageName = (relativePath) => {
    const tsconfigAbsolutePath = path.resolve(meta.dir, relativePath);
    const metadata = packageMeta.find((meta) => meta.tsconfig === tsconfigAbsolutePath);
    return metadata && metadata.name;
  };

  const currentReferencedPackages = tsconfig.references.map((ref) => relativePathToPackageName(ref.path));

  const adds = meta.deps.filter((dep) => !currentReferencedPackages.includes(dep));
  const removes = currentReferencedPackages.filter((dep) => !meta.deps.includes(dep));

  if (adds.length > 0 || removes.length > 0) {
    adds.forEach((add) => {
      const addMeta = packageMeta.find((meta) => meta.name === add);
      return tsconfig.references.push({ path: path.relative(meta.dir, addMeta.tsconfig) });
    });

    tsconfig.references = tsconfig.references.filter((ref) => !removes.includes(relativePathToPackageName(ref.path)));

    const addStr = adds.length ? ' added ' + adds.join(', ') : '';
    const removeStr = removes.length ? ' removed ' + adds.join(', ') : '';

    console.log(`${meta.tsconfig}:${addStr}${removeStr}`);
  }

  writeJson(meta.tsconfig, tsconfig);
  await formatTsconfig(meta.tsconfig);
});

const rootTsconfigPath = path.resolve(root, 'tsconfig.json');
const rootTsconfig = readJson(rootTsconfigPath);
rootTsconfig.files = rootTsconfig.files || [];
rootTsconfig.references = packageMeta.map((meta) => {
  const relativePath = path.relative(root, meta.tsconfig);
  return { path: relativePath };
});
writeJson(rootTsconfigPath, rootTsconfig);
formatTsconfig(rootTsconfigPath);
