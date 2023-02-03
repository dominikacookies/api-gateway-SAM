import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { createDynamoDBLocal, getDynamoDBLocal } from '../dynamoLocal/localDb';

export const generateUrlHandler = async (event: APIGatewayEvent) => {
  await createDynamoDBLocal();
  const docClient = getDynamoDBLocal();

  return docClient
    .put({
      TableName: 'privarss-db',
      Item: {
        id: `${Date.now().toLocaleString()}`,
        foo: 'bar',
      },
    })
    .promise()
    .catch((e) => ({
      statusCode: 500,
      body: 'nope',
    }))
    .then(() => ({
      statusCode: 200,
      body: 'yep',
    }));
};
