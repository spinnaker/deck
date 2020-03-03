#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');
const kleur = require('kleur');
const ansi = require('sisteransi');
const { execSync } = require('child_process');

process.cwd(__dirname);
const p = str => process.stdout.write(str);
const files = fs.readdirSync(process.cwd());
const pkgs = files.filter(file => fs.statSync(file).isDirectory() && fs.existsSync(path.join(file, 'package.json')));

try {
  // execSync('sh -c "./assert_clean_master.sh"');
} catch (error) {
  process.exit(1);
}

///////////////////////////////
// Fetch changelogs
///////////////////////////////

function status(message, index, total) {
  p(ansi.erase.lines(3));
  p(`${message}\n`);
  p(kleur.blue(`[${'='.repeat(index)}${' '.repeat(total - index)}]`) + ` (${index}/${total})\n`);
}

p('\n\n');
status(`Fetching changelogs`, 0, pkgs.length);
const changelogs = pkgs.map((pkg, index) => {
  status(`Fetching changelog for ${kleur.bold(pkg)}...`, index, pkgs.length);
  return {
    pkg,
    lines: execSync(`/bin/sh -c './show_changelog.sh "${pkg}/package.json"'`)
      .toString()
      .split(/[\r\n]/)
      .filter(str => !!str),
  };
});

status(`Fetched ${pkgs.length} changelogs`, pkgs.length, pkgs.length);

///////////////////////////////
// Ask user to choose packages
///////////////////////////////

const choices = changelogs.map(({ pkg, lines }) => {
  const commitSummary = lines.length ? kleur.bold(`(${lines.length} unpublished commits)`) : kleur.dim('(not dirty)');
  return {
    selected: lines.length > 0,
    value: pkg,
    title: `${kleur.green(pkg)} ${commitSummary}`,
  };
});

// Render a colorful changelog (above the menu) for the current item
function renderChangelog(changelog) {
  const lineCount = changelog.lines.length;
  const maxLineCount = changelogs.reduce((max, cl) => Math.max(max, cl.lines.length), 0);
  const maxWidth = typeof process.stdout.getWindowSize === 'function' ? process.stdout.getWindowSize()[0] : 100;

  const lines = changelog.lines
    .map(str => str.replace(/^([a-f0-9]{7})[a-f0-9]{33} /, '$1 ')) // show first 7 chars of hash
    .map(str => (str.length > maxWidth ? str.slice(0, maxWidth - 3) + kleur.dim('...') : str)) // truncate and ellipsis
    .map(str => str.replace(/^[a-f0-9]{7} /, match => kleur.green(match)))
    .map(str => str.replace(/(?:fix|chore|feat|docs|test|refactor)\([^)]*\): /, match => kleur.blue(match)))
    .map(str => str.replace(/\(#[0-9]+\)$/, match => kleur.green(match)));

  // Add "blank" lines so the number of lines is consistent and the screen doesn't jump around
  return '\n' + (lines.length ? lines.join('\n') + '\n' : '') + '#\n'.repeat(maxLineCount - lineCount);
}

const prompt = {
  name: 'result',
  type: 'multiselect',
  message: 'bump which packages?',
  optionsPerPage: 15,
  choices,
  onRender: function() {
    this.instructions = renderChangelog(changelogs[this.cursor]);
  },
};

(async () => {
  const { result } = await prompts(prompt);
  bumpPackages(result);
})();

///////////////////////////////
// Bump versions and create PR
///////////////////////////////

function bumpPackages(packages = []) {
  try {
    // execSync(`sh -c "git checkout -b bump-packages"`);
    let commitMessage = 'chore(package): publish';
    packages.forEach(pkg => {
      execSync(`sh -c "cd ${pkg}; npm version patch --no-git-tag-version"`);
      const version = JSON.parse(fs.readFileSync(`${pkg}/package.json`).toString()).version;
      commitMessage += ` ${pkg}:${version}`;
    });
    execSync(`sh -c "git commit . -m '${commitMessage}'"`);
    // execSync(`sh -c "gh pr create"`)
  } finally {
    // execSync(`sh -c "git checkout master"`);
    // execSync(`sh -c "git branch -D bump-packages"`);
  }
}
