# Battlefy URL Shortener
This projects hosts the infrastructure and code for a URL shortener that runs on API Gateway, Lambda, and DynamoDb

## Architecture
There are 3 main components behinds this project:
* API Gateway: Fronts the application layer and accepts requests to a randomly generated endpoint. Can burst up to 5000 requests on AWS Free Tier - would need to file a request with AWS to get more
* Lambda: the application layer/underlying API listening for GET or POST requests, stores and retrieves persisted URLs from DynamoDB
* DynamoDB: the persistence layer for storing information on URLs

## Layout
* `functions/battlefy.ts` is the Lambda function; changes can be made there if we wish to add further functionality such as different request methods, input sanitization, etc.
* `lib/battlefy-stack.ts` is the AWS CDK code that deploys our infrastructure to AWS
* `.github/workflows/deploy.yaml` is the GitHub Action that deploys our AWS CDK code to an AWS account with specified access keys in the GitHub repository secrets

## Testing
Once deployed, the endpoint can be tested for GET and POST requests:

* `curl -X POST https://cipgny3mul.execute-api.us-west-2.amazonaws.com/prod -H "Content-Type: application/json" -d '{"url": "https://www.facebook.com"}'
* The response will come back with an id you can use to make the GET request
* https://cblzfgblqc.execute-api.us-west-2.amazonaws.com/prod/{id} on your browser to validate the redirect mechanism

### Local testing
It is possible to do some form of local testing with AWS SAM, but it's a bit challenging to perform integration tests/end-to-end tests that validate the functionality.

You can run `cdk synth --no-staging > template.yml` and `sam local invoke -e test/events/post.json` afterwards to invoke the Lambda against the existing DynamoDB in the AWS account. NOTE: this will not work without credentials to the AWS account.

Some areas of improvement to testing include:
* spinning up a local DynamoDB with pre-seeded data to validate functionality locally
* `sam local start-api` to also validate API Gateway functionality in tandem with Lambda