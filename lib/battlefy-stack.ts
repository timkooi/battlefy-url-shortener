import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime }from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as path from 'path';

export class BattlefyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const project_name = "battlefy-url-shortener"

    const table = new Table(this, project_name + "-table", {
      partitionKey: { name: "short_url", type: AttributeType.STRING}
    });

    const lambda = new NodejsFunction(this, "DynamoLambdaHandler", {
      runtime: Runtime.NODEJS_14_X,
      entry: path.join(__dirname, `/../functions/battlefy.ts`),
      handler: "handler",
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(lambda);

    const api = new apigateway.RestApi(this, project_name + "-api", {
      restApiName: project_name + "-api",
      description: "The API Gateway for interfacing with the URL shortener"
    });

    const resource = api.root.addResource("{id}");
    const requestModelName = "RequestModel"
    const requestModel = api.addModel(requestModelName, {
      contentType: 'application/json',
      modelName: requestModelName,
      schema: {
        schema: apigateway.JsonSchemaVersion.DRAFT4,
        title: requestModelName,
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          url: { type: apigateway.JsonSchemaType.STRING }
        }
      }
    });

    const lambdaIntegration = new apigateway.LambdaIntegration(lambda);

    resource.addMethod("GET", lambdaIntegration);
    api.root.addMethod("POST", lambdaIntegration, {
      requestValidatorOptions: {
        validateRequestBody: true,
      },
      requestModels: {
        'application/json': requestModel
      }
    });
  }
}
