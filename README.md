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

# test lambda(s)
pushd src/lambda/dev-env-schedule
pipenv run pytest
popd


# deploy
npm run deploy
./node_modules/.bin/cdk deploy --outputs-file ./cdk-outputs.json

# remove
npm run destroy
```

## TODO

* stashed changes for ApigatewayToLambda solution construct