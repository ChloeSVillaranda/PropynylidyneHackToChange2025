import { CreateTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const region = process.env.AWS_REGION ?? "us-east-1";
const client = new DynamoDBClient({ region });

const createDronesTable = new CreateTableCommand({
  TableName: process.env.DRONES_TABLE ?? "DroneFleet",
  AttributeDefinitions: [{ AttributeName: "droneId", AttributeType: "S" }],
  KeySchema: [{ AttributeName: "droneId", KeyType: "HASH" }],
  BillingMode: "PAY_PER_REQUEST",
  StreamSpecification: {
    StreamEnabled: true,
    StreamViewType: "NEW_AND_OLD_IMAGES"
  }
});

const createDroneImagesTable = new CreateTableCommand({
  TableName: process.env.DRONE_IMAGES_TABLE ?? "DroneImages",
  AttributeDefinitions: [
    { AttributeName: "droneId", AttributeType: "S" },
    { AttributeName: "timestamp", AttributeType: "S" },
    { AttributeName: "accessLevel", AttributeType: "S" }
  ],
  KeySchema: [
    { AttributeName: "droneId", KeyType: "HASH" },
    { AttributeName: "timestamp", KeyType: "RANGE" }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "AccessLevelIndex",
      KeySchema: [
        { AttributeName: "accessLevel", KeyType: "HASH" },
        { AttributeName: "timestamp", KeyType: "RANGE" }
      ],
      Projection: { ProjectionType: "ALL" }
    }
  ],
  BillingMode: "PAY_PER_REQUEST",
  StreamSpecification: {
    StreamEnabled: true,
    StreamViewType: "NEW_AND_OLD_IMAGES"
  }
});

const run = async () => {
  try {
    console.log("Creating Drones table...");
    await client.send(createDronesTable);
    console.log("Drones table created.");

    console.log("Creating DroneImages table...");
    await client.send(createDroneImagesTable);
    console.log("DroneImages table created.");
  } catch (error) {
    console.error("Failed to create tables:", error);
  }
};

run();

