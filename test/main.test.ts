import '@aws-cdk/assert/jest';
import { App, Stack } from '@aws-cdk/core';
import { RemoteDevelopmentConstruct } from '../src/main';

test('Snapshot', () => {
  const env = {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
  };

  const app = new App();
  const stack = new Stack(app, 'remote-development-stack', { env });
  new RemoteDevelopmentConstruct(stack, 'remote-development-construct');

  expect(stack).not.toHaveResource('AWS::S3::Bucket');
  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});