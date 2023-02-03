import * as AWS from "aws-sdk";
import { awsConfig } from "./aws-config";
import { data } from "./data";

const TableName = "privarss-db";

const table = {
  TableName,
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

const createDynamoDBLocal = async () => {
  AWS.config.update(awsConfig);

  // create table
  const dynamodb = new AWS.DynamoDB({
    endpoint: new AWS.Endpoint("http://localhost:8000"),
  });

  const tables = await dynamodb.listTables().promise();
  const tableExists = tables?.TableNames?.includes(TableName);

  if (!tableExists) {
    await dynamodb.createTable(table).promise();
    console.log("table created");
  } else {
    console.log("table already exists");
  }

  try {
    // optional to add dummy data
    const client = new AWS.DynamoDB.DocumentClient();
    let params = {
      TableName,
      Item: { id: "yhrios" },
    };

    data.map(async (item) => {
      params.Item = item;
      await client.put(params).promise();
    });

    let scanparams = {
      TableName,
    };

    const result = await client.scan(scanparams).promise();
    console.log("Below is the dummy data");
    console.log(result);
  } catch (err) {
    console.log(err);
  }
};
const getDynamoDBLocal = () => {
  AWS.config.update(awsConfig);
  const dynamodb = new AWS.DynamoDB({
    endpoint: new AWS.Endpoint("http://localhost:8000"),
  });
  const dynamoClient = new AWS.DynamoDB.DocumentClient();
  return dynamoClient;
};

export { createDynamoDBLocal, getDynamoDBLocal };
