# Spinnaker Core
window.spinnakerCore = require('spinnaker-core/dist');

## Getting started

The distributable version of this library is located in `dist/index.js`. The `less` files are located in `lib/presentation`.

Build the application locally with:

```bash
npm run build 
```

Run tests with:

```bash
npm test
```

## Local development

You'll want to use npm link to symlink a local version of this library against your deployable application and `webpack` to watch for changes and automatically update the `dist` directory.

In the `spinnaker-core` directory,

```bash
npm link
npm start
```

In the deployable directory,

```bash
npm link spinnaker-core
# start the application normally
```
