import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME : string = process.env.TABLE_NAME!;

/**
 * TODO
 */
export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    let body;
    let statusCode = '200';
    let headers = {
        'Content-Type': 'application/json',
    };

    try {
        switch (event.httpMethod) {
            case 'GET':
                var get_params = {
                     TableName: TABLE_NAME,
                     Key: {'short_url': event.pathParameters.id}
                    };
                body = await dynamo.get(get_params).promise();
                statusCode = '302';
                headers = {
                    'Location': body.Item.real_url
                };
                break;
            case 'POST':
                let url = Math.floor(Math.random() * 10000).toString()
                var post_params = {
                    TableName: TABLE_NAME,
                    Item: {
                        "short_url": url,
                        "real_url": JSON.parse(event.body).url
                        }
                    };
                body = await dynamo.put(post_params).promise();
                body = {'shortlink': url};
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = '400';
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};
