# Instructions

## Running the Backend

### Requirments
- SAM CLI 
- Docker

1. Create custom network for containers to communicate with each other
```bash
docker network create localstack-sam
```

2. Run local-stack on network (this will make a local dynamodb)
```bash
docker run --rm -d \
  --name localstack \
  --network localstack-sam \
  -p 4566:4566 \
  -e SERVICES="dynamodb,s3" \
  localstack/localstack
 ```

3. Create DynomoDB tables 
- Travel to `API-gateway/aws-gatewayAPI-simv1/tests/integration`
- Run: `./setup_dynamodb.sh `

4. Build the API Gateway
- Travel to `API-gateway/aws-gatewayAPI-simv1/`
- Run: `sam build`

5. Start the API Gateway
- Run: `sam local start-api --docker-network localstack-sam`

6. Test it out! =)
- single example: `curl http://localhost:3000/trans-dataanalysis`
- OR run the frontend to test full application


## Running the Frontend
1. Install dependencies 
- Travel to `PhonePayBudgetTracker/`
- Run: `npm install`

2. Install IOS config files
- Travel to `PhonePayBudgetTracker/ios/`
- Run: `pod install --repo-update --verbose`

3. Build the app
- Travel to `PhonePayBudgetTracker/`
- Run: `npx react-native run-ios --simulator="iPhone 16 Pro" --verbose`

4. Run the app
`npx expo start `
`i`

## Addtional Notes
I usally run the steps in this order when testing the full application:

- Frontend steps: 1, 2, 3
- Backend steps: 1, 2, 3, 4
- Frontend step 4 (wait for this to completely load)
- Backend step 5 (wait for this to load)

Then I login on the simulator and conduct tests 