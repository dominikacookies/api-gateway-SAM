import { aws_dynamodb, CfnOutput, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { RestApi, Cors, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';

export class PrivateRssApiStack extends Stack {
  public readonly resources: object;

  constructor(scope: Construct, id: string, props?: any) {
    super(scope, id, props);

    // CREATE API GATEWAY
    const apiGateway = new RestApi(this, 'PrivRssAPI', {
      restApiName: 'PrivRssApi',
      defaultCorsPreflightOptions: {
        allowOrigins: [
          'https://www.economist.com',
          'https://stage.economist.com',
          'https://dev.economist.com',
          'https://local.economist.com:3000',
          'https://localhost:3000',
          'http://localhost:3000',
        ],
        allowHeaders: [
          'Origin',
          'Access-Control-Allow-Origin',
          'Content-Type',
          'Authorization',
        ],
        allowMethods: ['OPTIONS', 'POST', 'GET'],
      },
    });

    // ADD PATHS TO APIGW
    const healthcheckResource = apiGateway.root.addResource('healthcheck');
    const generateUrlResource = apiGateway.root.addResource('generate-url');
    const dbGetterResource = apiGateway.root.addResource('db-get');

    // CREATE LAMBDA HANDLER FOR GW
    const healthcheckLambda = new NodejsFunction(
      this,
      props.stackName + 'healthcheck',
      {
        functionName: 'PrivRssHealthcheckLambda',
        runtime: Runtime.NODEJS_16_X,
        entry: join(__dirname, '../src/handlers/healthcheck.ts'),
        handler: 'healthCheckHandler',
        depsLockFilePath: join(__dirname, '../package-lock.json'),
      }
    );

    const generateUrl = new NodejsFunction(
      this,
      props.stackName + 'generateUrl',
      {
        functionName: 'PrivRssGenerateUrlLambda',
        runtime: Runtime.NODEJS_16_X,
        entry: join(__dirname, '../src/handlers/generate-url.ts'),
        handler: 'generateUrlHandler',
        depsLockFilePath: join(__dirname, '../package-lock.json'),
      }
    );

    const dbGetter = new NodejsFunction(this, props.stackName + 'dbGetter', {
      functionName: 'PrivRssDbGetterLambda',
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, '../src/handlers/dbGetter.ts'),
      handler: 'dbGetterHandler',
      depsLockFilePath: join(__dirname, '../package-lock.json'),
    });

    // ADD METHOD TO CALL LAMBDA HANDLER
    healthcheckResource.addMethod(
      'GET',
      new LambdaIntegration(healthcheckLambda)
    );

    generateUrlResource.addMethod('GET', new LambdaIntegration(generateUrl));
    dbGetterResource.addMethod('GET', new LambdaIntegration(dbGetter));

    // Define DynamoDB
    const dynamoDbTable = new aws_dynamodb.Table(this, `privarss-DynamoTable`, {
      tableName: 'privarss-db',
      tableClass: aws_dynamodb.TableClass.STANDARD,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'id',
        type: aws_dynamodb.AttributeType.STRING,
      },
      writeCapacity: 6,
      readCapacity: 6,
    });

    dynamoDbTable.grantReadWriteData(generateUrl);
    dynamoDbTable.grantReadWriteData(dbGetter);

    new CfnOutput(this, 'contentTable', { value: dynamoDbTable.tableArn });
  }
}
