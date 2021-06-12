# remote-development

project to facilitate remote development environment

## Requirements

* [projen](https://github.com/projen/projen/)

## Build & Deploy

```sh
npx projen new awscdk-app-ts

# make dep changes in `.projenrc.js` then run
npx projen

# watch
npm run test:watch

# update jest snapshots
npm run test:update

# deploy
npm run deploy

# remove
npm run destroy
```