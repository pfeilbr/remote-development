import boto3
import os
import json

region = os.environ.get("REGION")
instance_ids = json.loads(os.environ.get("INSTANCE_IDS"))
ec2 = boto3.client("ec2", region_name=region)
sns = boto3.client("sns", region_name=region)


def is_instance_running(instance_id):
    response = ec2.describe_instance_status(InstanceIds=[instance_id])
    try:
        return response["InstanceStatuses"][0]["InstanceState"]["Name"] == "running"
    except:
        return False


def instance_operation(event, context):
    # operation = getattr(event, 'operation', 'stop_instances')
    for instance_id in instance_ids:
        if is_instance_running(instance_id):
            ec2.stop_instances(InstanceIds=[instance_id])
            print("{} instance (instance_id={})".format("stop_instances", instance_id))
            notify(event, context)


def notify(event, context):
    topic_arn = region = os.environ.get("NOTIFY_TOPIC_ARN")
    sns.publish(
        TopicArn=topic_arn,
        Subject="stopped ec2 instance(s) ({})".format(str(instance_ids)),
        Message="stopped ec2 instance(s) with instance id(s) of {}".format(
            str(instance_ids)
        ),
    )
