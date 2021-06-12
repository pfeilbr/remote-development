import { App, Construct, Stack, StackProps, Duration } from '@aws-cdk/core';
import {PolicyStatement} from '@aws-cdk/aws-iam'

import events = require('@aws-cdk/aws-events');
import targets = require('@aws-cdk/aws-events-targets');
import lambda = require('@aws-cdk/aws-lambda');
import fs = require('fs');
import path = require('path')


export class RemoteDevelopmentStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const lambdaFn = new lambda.Function(this, 'Singleton', {
      code: new lambda.InlineCode(fs.readFileSync(path.join(__dirname, 'lambda', 'dev-env-schedule', 'lambda-handler.py'), { encoding: 'utf-8' })),
      handler: 'index.main',
      timeout: Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_8,
    });

    lambdaFn.addToRolePolicy(new PolicyStatement({
      resources: ['*'],
      actions: ['ec2:StartInstances', 'ec2:StopInstances']
    }))

    // Run every day at 6PM UTC
    // See https://docs.aws.amazon.com/lambda/latest/dg/tutorial-scheduled-events-schedule-expressions.html
    const rule = new events.Rule(this, 'Rule', {
      schedule: events.Schedule.expression('cron(0 4 * * ? *)') // midnight daily
    });

    rule.addTarget(new targets.LambdaFunction(lambdaFn));
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new RemoteDevelopmentStack(app, 'remote-development-stack', { env: devEnv });
// new RemoteDevelopmentStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();