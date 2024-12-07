#!/bin/bash

set -e

REGION="us-east-2"

INFRA_STACK_NAME="main-infra2"

PROFILE_DATA_TABLE_NAME=$(aws cloudformation describe-stacks --stack-name "$INFRA_STACK_NAME" --region "$REGION" --query "Stacks[0].Outputs[?OutputKey=='ProfileDataTableName'].OutputValue" --output text)
echo "Seeding Profile Data Table: $PROFILE_DATA_TABLE_NAME"

TRANSACTION_TABLE_NAME=$(aws cloudformation describe-stacks --stack-name "$INFRA_STACK_NAME" --region "$REGION" --query "Stacks[0].Outputs[?OutputKey=='TransactionDataTableName'].OutputValue" --output text)
echo "Seeding Transaction Data Table: $TRANSACTION_TABLE_NAME"

# Seed profileData table
aws dynamodb put-item \
    --table-name "$PROFILE_DATA_TABLE_NAME" \
    --item '{"pk": {"S": "abcd"}, "firstName": {"S": "Brennan"}, "lastName": {"S": "Mahoney"}, "password": {"S": "camino"}, "profilePhoto": {"S": "https://www.oakdale"}, "username": {"S": "bmahoney"}, "email": {"S": "bmm1@bu.edu"}, "accounts": {"S": ""}}' \
    --region $REGION

aws dynamodb put-item \
    --table-name "$PROFILE_DATA_TABLE_NAME" \
    --item '{"pk": {"S": "user2"}, "firstName": {"S": "Brennan"}, "lastName": {"S": "Mahoney"}, "password": {"S": "camino"}, "profilePhoto": {"S": "https://www.oakdaleveterinarygroup.com/cdn-cgi/image/q=75,f=auto,metadata=none/sites/default/files/styles/large/public/golden-retriever-dog-breed-info.jpg?itok=NWXHSSii"}, "username": {"S": "b"}, "email": {"S": "Bmahoney132@gmail.com"}, "accounts": {"S": ""}}' \
    --region $REGION

aws dynamodb put-item \
    --table-name "$PROFILE_DATA_TABLE_NAME" \
    --item '{"pk": {"S": "bmahoney1"}, "firstName": {"S": "Brennan"}, "lastName": {"S": "Mahoney"}, "password": {"S": "camino"}, "profilePhoto": {"S": "https://www.oakdale"}, "username": {"S": "bmahoney1"}, "email": {"S": "Bmm1@bu.edu"}, "accounts": {"S": ""}}' \
    --region $REGION

aws dynamodb put-item \
    --table-name "$PROFILE_DATA_TABLE_NAME" \
    --item '{"pk": {"S": "naomi"}, "firstName": {"S": "Naomi"}, "lastName": {"S": "Gonzalez"}, "password": {"S": "test123"}, "profilePhoto": {"S": "https://www.oakdale"}, "username": {"S": "ngonz"}, "email": {"S": "ngonzalz@bu.edu"}, "accounts": {"S": ""}}' \
    --region $REGION

# Seed transactionData table
aws dynamodb put-item \
    --table-name "$TRANSACTION_TABLE_NAME" \
    --item '{"pk": {"S": "bmahoney"}, "sk": {"S": "2024-09-01#t-001"}, "amount": {"N": "-850"}, "expenseName": {"S": "rent"}}' \
    --region $REGION

aws dynamodb put-item \
    --table-name "$TRANSACTION_TABLE_NAME" \
    --item '{"pk": {"S": "bmahoney"}, "sk": {"S": "2024-09-01#t-002"}, "amount": {"N": "-100"}, "expenseName": {"S": "electric"}}' \
    --region $REGION

aws dynamodb put-item \
    --table-name "$TRANSACTION_TABLE_NAME" \
    --item '{"pk": {"S": "bmahoney"}, "sk": {"S": "2024-09-01#t-003"}, "amount": {"N": "3000"}, "expenseName": {"S": "salary"}}' \
    --region $REGION

aws dynamodb put-item \
    --table-name "$TRANSACTION_TABLE_NAME" \
    --item '{"pk": {"S": "bmahoney"}, "sk": {"S": "2024-09-01#t-004"}, "amount": {"N": "-60"}, "expenseName": {"S": "gym membership"}}' \
    --region $REGION

echo "Data seeding completed successfully."
