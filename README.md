# Spinnaker UI

![Deck CI](https://github.com/spinnaker/deck/workflows/Deck%20CI/badge.svg)

## Prerequisites

Make sure that [node](http://nodejs.org/download/) and [yarn](https://yarnpkg.com/en/docs/install) are installed on your system.
The minimum versions for each are listed in package.json.

## Quick Start

Run the following commands (in the deck directory) to get all dependencies installed in deck and to start the server:

- `yarn`
- `yarn start`

The app will start up on localhost:9000.

## Environment variables

Environment variables can be used to configure application behavior. The following lists those variables and their possible values:

- `AUTH` enable/disable authentication (default is disabled, enable by setting `AUTH=enabled`).
- `TIMEZONE` set the default timezone (default is 'America/Los_Angeles' - see http://momentjs.com/timezone/docs/#/data-utilities/ for options)
- `DECK_CERT` enable SSL (set to the fully qualified path to cert file, and `DECK_KEY` must be set to the fully qualified path to the key file)

The following external resources can be specified with environment variables:

- `API_HOST` overrides the default Spinnaker API host.
- `AUTH_ENABLED` determines whether Deck will attempt to authenticate users via Gate.

For example, `API_HOST=http://spinnaker.prod.netflix.net yarn start` will run Deck with `http://spinnaker.prod.netflix.net` as the API host.

## Testing

To run the tests within the application, run `yarn test`.

Developing things locally? You may want to run [gate](https://github.com/spinnaker/gate) locally (which runs on port 8084) as well.
Gate is the service that hosts the spinnaker REST API.
Then run deck like this:

```
API_HOST=http://localhost:8084 yarn start
```

## Building &amp; Deploying

To build the application, run `yarn build`.
The built application lives in `build/`.

## Conventions

It's a work in progress, but please try to follow the [conventions here](https://github.com/spinnaker/deck/wiki/Conventions).

## Customizing the UI

It's certainly doable - we're in the middle of some significant changes to our build process, which should make it easier.
For now, you can look at the [all modules](https://github.com/spinnaker/deck/tree/master/app/scripts/modules/) to
get an idea how we are customizing Deck internally. Expect a lot of this to change, though, as we figure out better, cleaner
hooks and integration points. And we're happy to provide new integration points (or accept pull requests) following
those existing conventions if you need an integration point that doesn't already exist.

## Join Us

Interested in sharing feedback on Spinnaker's UI or contributing to Deck?
Please join us at the [Spinnaker UI SIG](https://github.com/spinnaker/governance/tree/master/sig-ui-ux)!
