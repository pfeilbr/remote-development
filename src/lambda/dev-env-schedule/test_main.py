import pytest
import main
import boto3
import os
import json

lambda_client = boto3.client('lambda')

def get_cdk_output(name):
    script_directory_path=os.path.dirname(os.path.realpath(__file__))
    cdk_outputs_file_path=os.path.join(script_directory_path, '..', '..', '..', 'cdk-outputs.json')
    with open(cdk_outputs_file_path) as json_file:
        data = json.load(json_file)
    return data['remote-development-stack'][name]


def test_instance_operation():
    response = lambda_client.invoke(FunctionName=get_cdk_output('InstanceOperationLambdaFunctionName'),
    Payload='{}') # '{"operation": "start_instances"}'
    print(response)
    assert True == True