 # @spinnaker/pluginsdk-peerdeps

 This package contains a `package.json` with `peerDependencies`.
 A Deck plugin should have a dependency on `@spinnaker/pluginsdk-peerdeps`.
 This package's `peerDependencies` informs the plugin's of the versions of packages it should install.

 # Updating this package

There are four package scripts to help maintain the list of `peerDependencies`:

- `yarn help`:  Shows this help text
- `yarn stage`: Scaffolds a blank plugin into a temporary directory.
                Updates the scaffold's `dependencies` to match those currently in Deck.
                After running this, update the scaffolded `package.json` to the desired dependency versions.
- `yarn sync`:  Syncs the desired dependency versions from the temporary directory to this `package.json`'s `peerDependencies`.
                This is useful to update peer devDependencies.
- `yarn clean`: Deletes the temp scaffold directory

## typical usage

```
yarn stage
cd $(cat .scaffolddir)
yarn upgrade-interactive --latest
git diff
popd
yarn sync

git commit -m "Updated dependencies" package.json
npm version patch --no-git-tag-version
```
