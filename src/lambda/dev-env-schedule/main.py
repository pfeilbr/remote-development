import boto3
import os
import json

region = os.environ.get("REGION")
instances = json.loads(os.environ.get("INSTANCE_IDS"))
ec2 = boto3.client("ec2", region_name=region)

def instance_operation(event, context):
    ec2.stop_instances(InstanceIds=instances)
    print("stopped your instances: " + str(instances))
