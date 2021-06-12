import boto3

region = "us-east-1"
instances = ["i-06c49f207e012e481"]
ec2 = boto3.client("ec2", region_name=region)


def main(event, context):
    ec2.stop_instances(InstanceIds=instances)
    print("stopped your instances: " + str(instances))
