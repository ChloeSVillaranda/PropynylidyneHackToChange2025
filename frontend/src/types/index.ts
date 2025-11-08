export * from './mission';
export * from './drone';
export * from './auth';

// Unified DynamoDB entity type
export type EntityType = 'DRONE' | 'MISSION' | 'profile';

// Base interface for DynamoDB items
export interface DynamoDBItem {
  droneId: string; // Partition key
  entityType: EntityType; // Sort key or entity discriminator
}
