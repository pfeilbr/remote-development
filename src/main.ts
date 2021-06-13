
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { PythonFunction } from '@aws-cdk/aws-lambda-python';
import { App, Construct, Stack, StackProps, Duration } from '@aws-cdk/core';

export class RemoteDevelopmentStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const lambdaFn = new PythonFunction(this, 'ScheduledDevelopmentEnvironment', {
      entry: 'src/lambda/dev-env-schedule', // required
      index: 'main.py', // optional, defaults to 'index.py'
      handler: 'instance_operation', // optional, defaults to 'handler'
      timeout: Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_8, // optional, defaults to lambda.Runtime.PYTHON_3_7
      environment: {
        REGION: 'us-east-1',
        INSTANCE_IDS: '["i-06c49f207e012e481"]',
      },
    });

    lambdaFn.addToRolePolicy(new PolicyStatement({
      resources: ['*'],
      actions: ['ec2:StartInstances', 'ec2:StopInstances'],
    }));

    // Run every day at 6PM UTC
    // See https://docs.aws.amazon.com/lambda/latest/dg/tutorial-scheduled-events-schedule-expressions.html
    const rule = new events.Rule(this, 'Rule', {
      schedule: events.Schedule.expression('cron(0 4 * * ? *)'), // midnight daily
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