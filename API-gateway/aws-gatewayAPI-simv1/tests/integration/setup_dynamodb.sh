#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Set the endpoint URL
ENDPOINT_URL="http://localhost:4566"

# Set AWS credentials and varibles
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-test}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-test}"
export AWS_PAGER=""

# Wait for DynamoDB to be ready
echo "Waiting for DynamoDB service to be ready..."
until aws dynamodb list-tables --endpoint-url $ENDPOINT_URL > /dev/null 2>&1; do
    sleep 5
done
echo "DynamoDB service is ready."

# Function to create a DynamoDB table
create_table() {
    local table_name=$1
    local attribute_definitions=$2
    local key_schema=$3

    echo "Creating DynamoDB table: $table_name"

    aws dynamodb create-table \
        --table-name "$table_name" \
        --attribute-definitions "$attribute_definitions" \
        --key-schema "$key_schema" \
        --billing-mode PAY_PER_REQUEST \
        --endpoint-url $ENDPOINT_URL

    echo "Waiting for table $table_name to be active..."
    aws dynamodb wait table-exists \
        --table-name "$table_name" \
        --endpoint-url $ENDPOINT_URL

    echo "Table $table_name created successfully."
}

# Function to seed data into a DynamoDB table
seed_data() {
    local table_name=$1
    local item=$2

    echo "Seeding data into table: $table_name"

    aws dynamodb put-item \
        --table-name "$table_name" \
        --item "$item" \
        --endpoint-url $ENDPOINT_URL

    echo "Data seeded into table $table_name."
}

# Create profileData table
create_table "profileData" \
    '[{"AttributeName":"pk","AttributeType":"S"}]' \
    '[{"AttributeName":"pk","KeyType":"HASH"}]'

# Seed profileData table
seed_data "profileData" '{"pk": {"S": "abcd"}, "firstName": {"S": "Brennan"}, "lastName": {"S": "Mahoney"}, "password": {"S": "camino"}, "profilePhoto": {"S": "https://www.oakdale"}, "username": {"S": "bmahoney"}, "email": {"S": "bmm1@bu.edu"}}'
seed_data "profileData" '{"pk": {"S": "b"}, "firstName": {"S": "Brennan"}, "lastName": {"S": "Mahoney"}, "password": {"S": "camino"}, "profilePhoto": {"S": "https://www.oakdale"}, "username": {"S": "b"}, "email": {"S": "Bmahoney132@gmail.com"}}'
seed_data "profileData" '{"pk": {"S": "bmahoney1"}, "firstName": {"S": "Brennan"}, "lastName": {"S": "Mahoney"}, "password": {"S": "camino"}, "profilePhoto": {"S": "https://www.oakdale"}, "username": {"S": "bmahoney1"}, "email": {"S": "Bmm1@bu.edu"}}'

# Create transactionData table
create_table "transactionData" \
    '[{"AttributeName":"pk","AttributeType":"S"}, {"AttributeName":"sk","AttributeType":"S"}]' \
    '[{"AttributeName":"pk","KeyType":"HASH"}, {"AttributeName":"sk","KeyType":"RANGE"}]'

# Seed transactionData table
seed_data "transactionData" '{"pk": {"S": "bmahoney"}, "sk": {"S": "2024-09-01#t-001"}, "amount": {"N": "-850"}, "expenseName": {"S": "rent"}}'
seed_data "transactionData" '{"pk": {"S": "bmahoney"}, "sk": {"S": "2024-09-01#t-002"}, "amount": {"N": "-100"}, "expenseName": {"S": "electric"}}'
seed_data "transactionData" '{"pk": {"S": "bmahoney"}, "sk": {"S": "2024-09-01#t-003"}, "amount": {"N": "3000"}, "expenseName": {"S": "salary"}}'
seed_data "transactionData" '{"pk": {"S": "bmahoney"}, "sk": {"S": "2024-09-01#t-004"}, "amount": {"N": "-60"}, "expenseName": {"S": "gym membership"}}'

# Create AdminControlTable
create_table "AdminControlTable" \
    '[{"AttributeName":"id","AttributeType":"S"}]' \
    '[{"AttributeName":"id","KeyType":"HASH"}]'

