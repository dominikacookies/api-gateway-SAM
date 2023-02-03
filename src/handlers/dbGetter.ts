import { APIGatewayEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { createDynamoDBLocal, getDynamoDBLocal } from '../dynamoLocal/localDb';

export const dbGetterHandler = async (event: APIGatewayEvent) => {
  await createDynamoDBLocal();
  const docClient = getDynamoDBLocal();

  return docClient
    .scan({
      TableName: 'privarss-db',
    })
    .promise()
    .catch((e) => {
      console.log(e);
      return {
        statusCode: 500,
        body: 'nope',
      };
    })
    .then((data) => ({
      statusCode: 200,
      body: JSON.stringify(data),
    }));
};
