
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { PythonFunction } from '@aws-cdk/aws-lambda-python';
import * as sns from '@aws-cdk/aws-sns';
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';
import { App, Construct, Stack, Duration, CfnOutput } from '@aws-cdk/core';

export class RemoteDevelopmentConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // cdk synth --context key1=value1 --context key2=value2 MyStack
    // this.node.tryGetContext('vpcid');

    const notifyTopic = new sns.Topic(this, 'NotifyTopic');
    notifyTopic.addSubscription(new subscriptions.EmailSubscription('brian.pfeil@gmail.com'));


    const lambdaFn = new PythonFunction(this, 'ScheduledDevelopmentEnvironment', {
      entry: 'src/lambda/dev-env-schedule', // required
      index: 'main.py', // optional, defaults to 'index.py'
      handler: 'instance_operation', // optional, defaults to 'handler'
      timeout: Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_8, // optional, defaults to lambda.Runtime.PYTHON_3_7
      environment: {
        REGION: 'us-east-1',
        INSTANCE_IDS: '["i-06c49f207e012e481"]',
        NOTIFY_TOPIC_ARN: notifyTopic.topicArn,
      },
    });

    notifyTopic.grantPublish(lambdaFn);

    lambdaFn.addToRolePolicy(new PolicyStatement({
      resources: ['*'],
      actions: ['ec2:StartInstances', 'ec2:StopInstances', 'ec2:Describe*', 'ec2:List*', 'ec2:Get*'],
    }));

    // Run every day at 6PM UTC
    // See https://docs.aws.amazon.com/lambda/latest/dg/tutorial-scheduled-events-schedule-expressions.html
    const rule = new events.Rule(this, 'Rule', {
      schedule: events.Schedule.expression('cron(0 4 * * ? *)'), // midnight daily
    });

    rule.addTarget(new targets.LambdaFunction(lambdaFn));

    new CfnOutput(this, 'InstanceOperationLambdaFunctionName', { value: lambdaFn.functionName });
    new CfnOutput(this, 'InstanceOperationLambdaFunctionArn', { value: lambdaFn.functionArn });
    new CfnOutput(this, 'CronRuleName', { value: rule.ruleName });
    new CfnOutput(this, 'CronRuleArn', { value: rule.ruleArn });
    new CfnOutput(this, 'NotifyTopicName', { value: notifyTopic.topicName });
    new CfnOutput(this, 'NotifyTopicArn', { value: notifyTopic.topicArn });
  }
}

const env = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
};

const app = new App();
const stack = new Stack(app, 'remote-development-stack', { env });
new RemoteDevelopmentConstruct(stack, 'remote-development-construct');
app.synth();