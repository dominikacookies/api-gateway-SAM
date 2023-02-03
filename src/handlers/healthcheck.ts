import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from 'aws-lambda/trigger/api-gateway-proxy';

export const healthCheckHandler: APIGatewayProxyHandler = async (
  event: APIGatewayEvent
) => {
  console.log('hello v2');

  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: 'hello',
  };

  return result;
};
