import boto3
import sys
import argparse
from typing import List

def get_stack_outputs(stack_names: List[str], region: str = 'us-east-2'):
    """
    Retrieves and prints the outputs for the specified CloudFormation stacks.

    :param stack_names: List of CloudFormation stack names.
    :param region: AWS region where the stacks are deployed.
    """
    client = boto3.client('cloudformation', region_name=region)

    for stack_name in stack_names:
        print(f"\n=== Outputs for Stack: {stack_name} ===")
        try:
            response = client.describe_stacks(StackName=stack_name)
            stacks = response.get('Stacks', [])
            
            if not stacks:
                print(f"No stack found with name: {stack_name}")
                continue
            
            stack = stacks[0]
            outputs = stack.get('Outputs', [])
            
            if not outputs:
                print(f"No outputs defined for stack: {stack_name}")
                continue
            
            for output in outputs:
                output_key = output.get('OutputKey', 'N/A')
                output_value = output.get('OutputValue', 'N/A')
                print(f"{output_key}: {output_value} \t\t ")
        
        except client.exceptions.ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'ValidationError':
                print(f"Validation Error: {e.response['Error']['Message']}")
            elif error_code == 'Throttling':
                print(f"Throttling Error: {e.response['Error']['Message']}")
            else:
                print(f"An error occurred: {e.response['Error']['Message']}")
    
    print("\n=== Done ===")

def parse_arguments():
    """
    Parses command-line arguments.

    :return: Parsed arguments.
    """
    parser = argparse.ArgumentParser(description="Retrieve CloudFormation stack outputs for multiple microservices.")
    parser.add_argument(
        '--stacks',
        nargs='+',
        required=False,
        help="List of stack names to retrieve outputs for. If not provided, defaults will be used."
    )
    parser.add_argument(
        '--region',
        type=str,
        default='us-east-2',
        help="AWS region where the stacks are deployed. Default is 'us-east-2'."
    )
    return parser.parse_args()

def main():
    args = parse_arguments()
    
    # Define your default stack names here
    default_stacks = [
        'main-infra2',
        'user-profile-service',
        'admin-control-service',
        'transaction-analysis-service'
    ]
    
    # Use provided stack names or default
    stack_names = args.stacks if args.stacks else default_stacks
    region = args.region
    
    get_stack_outputs(stack_names, region)

if __name__ == "__main__":
    main()
