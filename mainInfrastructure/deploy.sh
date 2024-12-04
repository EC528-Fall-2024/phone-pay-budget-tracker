#!/bin/bash

set -e

# ----------------------------
# Environment Variables Setup
# ----------------------------
S3_BUCKET_NAME="phonepay"
REGION="us-east-2"
INFRA_STACK_NAME="main-infra2"
PLAID_CLIENT_ID="67059ac70f3934001bb637ab"
PLAID_SECRET="6480180b111c6e48efe009f6d5d568"
COGNITO_USER_POOL_ID="us-east-2_wiIIvkrzs"

# ----------------------------
# Function Definitions
# ----------------------------

# Function to deploy a SAM stack with no-fail on empty changeset
deploy_stack() {
  local template_file=$1
  local stack_name=$2
  shift 2
  local deploy_args="$@"

  echo "Deploying stack: $stack_name..."
  sam deploy \
    --template-file "$template_file" \
    --stack-name "$stack_name" \
    --s3-bucket "$S3_BUCKET_NAME" \
    --region "$REGION" \
    --capabilities CAPABILITY_IAM \
    --no-fail-on-empty-changeset \
    $deploy_args
}

# Function to check stack status of a given stack
check_stack_status() {
  local stack_name=$1
  aws cloudformation describe-stacks --region "$REGION" --stack-name "$stack_name" --query "Stacks[0].StackStatus" --output text 2>/dev/null || echo "STACK_DOES_NOT_EXIST"
}

# Function to delete stack if in ROLLBACK_COMPLETE or other terminal states
cleanup_stack() {
  local stack_name=$1
  local status=$(check_stack_status "$stack_name")

  if [[ "$status" == "ROLLBACK_COMPLETE" || "$status" == "CREATE_FAILED" || "$status" == "UPDATE_ROLLBACK_COMPLETE" ]]; then
    echo "Stack $stack_name is in $status state. Deleting stack..."
    aws cloudformation delete-stack --stack-name "$stack_name" --region "$REGION"
    aws cloudformation wait stack-delete-complete --stack-name "$stack_name" --region "$REGION"
    echo "Stack $stack_name deleted successfully."
  fi
}

# ----------------------------
# Deployment Process
# ----------------------------

# Deploy Main Infrastructure Stack
cleanup_stack "$INFRA_STACK_NAME"
echo "Deploying Main Infrastructure Stack: $INFRA_STACK_NAME..."
sam build
sam validate --template-file .aws-sam/build/template.yaml
sam package --output-template-file packaged.yaml --s3-bucket "$S3_BUCKET_NAME" --region "$REGION"
deploy_stack "packaged.yaml" "$INFRA_STACK_NAME"

# Retrieve Outputs from Main Infrastructure
echo "Retrieving Outputs from Main Infrastructure Stack..."
PROFILE_DATA_TABLE_NAME=$(aws cloudformation describe-stacks --stack-name "$INFRA_STACK_NAME" --region "$REGION" --query "Stacks[0].Outputs[?OutputKey=='ProfileDataTableName'].OutputValue" --output text)
echo "PROFILE_DATA_TABLE_NAME: $PROFILE_DATA_TABLE_NAME"

TRANSACTION_TABLE_NAME=$(aws cloudformation describe-stacks --stack-name "$INFRA_STACK_NAME" --region "$REGION" --query "Stacks[0].Outputs[?OutputKey=='TransactionDataTableName'].OutputValue" --output text)
echo "TRANSACTION_TABLE_NAME: $TRANSACTION_TABLE_NAME"

# Deploy User Profile Service
echo "Deploying User Profile Service..."
cd "../microservices/User-Profile/"
sam build
sam validate --template-file .aws-sam/build/template.yaml
TEMPLATE_PATH=".aws-sam/build/template.yaml"
cleanup_stack "user-profile-service"
deploy_stack "$TEMPLATE_PATH" "user-profile-service" \
  --parameter-overrides ProfileDataTableName="$PROFILE_DATA_TABLE_NAME" CognitoUserPoolId="$COGNITO_USER_POOL_ID"

cd ..

# Deploy Admin Control Service
echo "Deploying Admin Control Service..."
cd "../microservices/Admin-Control/"
sam build
sam validate --template-file .aws-sam/build/template.yaml
TEMPLATE_PATH=".aws-sam/build/template.yaml"
cleanup_stack "admin-control-service"
deploy_stack "$TEMPLATE_PATH" "admin-control-service" \
  --parameter-overrides ProfileDataTableName="$PROFILE_DATA_TABLE_NAME"

cd ..

# Deploy Transaction Analysis Microservice
echo "Deploying Transaction Analysis Microservice..."
cd "../microservices/Trans-DataAnalysis/"
sam build
sam validate --template-file .aws-sam/build/template.yaml
TEMPLATE_PATH=".aws-sam/build/template.yaml"
cleanup_stack "transaction-analysis-service"
deploy_stack "$TEMPLATE_PATH" "transaction-analysis-service" \
  --parameter-overrides TransactionDataTableName="$TRANSACTION_TABLE_NAME" \
                        PlaidClientId="$PLAID_CLIENT_ID" \
                        PlaidSecret="$PLAID_SECRET" \
                        CognitoUserPoolId="$COGNITO_USER_POOL_ID" \
                        CognitoRegion="$REGION"

cd ../..

echo "Deployment completed successfully."
