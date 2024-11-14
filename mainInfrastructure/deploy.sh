#!/bin/bash

set -e

# Set the environment variables
S3_BUCKET_NAME="NEED_TO_BE_REPLACED"
REGION="NEED_TO_BE_REPLACED"
INFRA_STACK_NAME="NEED_TO_BE_REPLACED"

# Deploy main infrastructure
echo "Deploying main infrastructure..."
cd ../mainInfrastructure/
sam build
sam package --output-template-file packaged.yaml --s3-bucket $S3_BUCKET_NAME
sam deploy --template-file packaged.yaml --stack-name $INFRA_STACK_NAME --region $REGION --capabilities CAPABILITY_IAM
cd ..

# Fetch Outputs from main infrastructure
API_GATEWAY_ID=$(aws cloudformation describe-stacks --stack-name $INFRA_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='SharedApiGatewayId'].OutputValue" --output text)
echo "API_GATEWAY_ID: $API_GATEWAY_ID"
PROFILE_DATA_TABLE_NAME=$(aws cloudformation describe-stacks --stack-name $INFRA_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='ProfileDataTableName'].OutputValue" --output text)
echo "PROFILE_DATA_TABLE_NAME: $PROFILE_DATA_TABLE_NAME"
TRANSACTION_TABLE=$(aws cloudformation describe-stacks --stack-name $INFRA_STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='TransactionTableName'].OutputValue" --output text)
echo "TRANSACTION_TABLE: $TRANSACTION_TABLE"

# Deploy user profile service
echo "Deploying user profile service..."
cd microservices/User-Profile/
sam build
sam deploy \
  --stack-name user-profile-service \
  --s3-bucket $S3_BUCKET_NAME \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    ProfileDataTableName=$PROFILE_DATA_TABLE_NAME \
    SharedApiGatewayId=$API_GATEWAY_ID
cd ../..

# Deploy admin control service
echo "Deploying admin control service..."
cd microservices/admin-control/
sam build
sam deploy \
  --stack-name admin-control-service \
  --s3-bucket $S3_BUCKET_NAME \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    ProfileDataTableName=$PROFILE_DATA_TABLE_NAME \
    ApiGatewayId=$API_GATEWAY_ID
cd ../..