import dotenv from "dotenv";
import swaggerJsdoc, { OAS3Options } from "swagger-jsdoc";

dotenv.config();

const baseUrl = process.env.API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 4000}`;

const options: OAS3Options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Propynylidyne Drone Management API",
      version: "0.2.0",
      description:
        "REST API for managing drones, schedules, and imagery for the Propynylidyne Hack project."
    },
    servers: [
      {
        url: baseUrl
      }
    ],
    components: {
      schemas: {
        GeoPoint: {
          type: "object",
          properties: {
            latitude: {
              type: "number",
              example: 37.7749
            },
            longitude: {
              type: "number",
              example: -122.4194
            }
          }
        },
        DroneMetadata: {
          type: "object",
          additionalProperties: {
            oneOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }]
          },
          example: {
            firmware: "v1.2.0",
            batteryLevel: 87
          }
        },
        Drone: {
          type: "object",
          required: ["entityType", "droneId", "model", "status"],
          properties: {
            entityType: {
              type: "string",
              enum: ["DRONE", "MISSION"],
              example: "DRONE",
              description: "Partition type used for entities stored in the drones table."
            },
            droneId: {
              type: "string",
              example: "drone-001"
            },
            model: {
              type: "string",
              example: "DJI-M300"
            },
            status: {
              type: "string",
              enum: ["Available", "Busy", "Maintenance"],
              example: "Available"
            },
            currentLocation: {
              $ref: "#/components/schemas/GeoPoint"
            },
            patrolSchedule: {
              type: "object",
              properties: {
                windowStart: { type: "string", format: "date-time" },
                windowEnd: { type: "string", format: "date-time" },
                cadence: { type: "string", example: "0 */2 * * *" }
              }
            },
            lastMaintenance: {
              type: "string",
              format: "date-time",
              example: "2025-08-01T10:00:00.000Z"
            },
            lastImageTimestamp: {
              type: "string",
              format: "date-time"
            },
            metadata: {
              $ref: "#/components/schemas/DroneMetadata"
            },
            startTime: {
              type: "string",
              format: "date-time",
              description: "Defined only when entityType is MISSION."
            },
            endTime: {
              type: "string",
              format: "date-time",
              description: "Defined only when entityType is MISSION."
            },
            route: {
              type: "array",
              items: { $ref: "#/components/schemas/GeoPoint" },
              description: "Ordered list of waypoints for mission entities."
            },
            missionType: {
              type: "string",
              description: "Mission classification (MISSION entities only).",
              example: "Patrol"
            }
          }
        },
        Mission: {
          type: "object",
          required: ["entityType", "droneId"],
          properties: {
            entityType: {
              type: "string",
              enum: ["MISSION"],
              example: "MISSION"
            },
            droneId: {
              type: "string",
              example: "mission-001"
            },
            missionId: {
              type: "string",
              example: "mission-001",
              description: "Mission identifier (mirrors the partition key)."
            },
            assignedDroneId: {
              type: "string",
              example: "drone-001",
              description: "Drone currently assigned to execute this mission."
            },
            missionType: {
              type: "string",
              enum: ["Patrol", "Emergency", "Recon", "Delivery", "SearchAndRescue"],
              example: "Patrol"
            },
            startTime: {
              type: "string",
              format: "date-time"
            },
            endTime: {
              type: "string",
              format: "date-time"
            },
            route: {
              type: "array",
              items: { $ref: "#/components/schemas/GeoPoint" }
            },
            metadata: {
              $ref: "#/components/schemas/DroneMetadata"
            }
          }
        },
        CreateDroneRequest: {
          type: "object",
          required: ["droneId", "model"],
          properties: {
            droneId: { type: "string" },
            model: { type: "string", example: "DJI-M300" },
            status: {
              type: "string",
              enum: ["Available", "Busy", "Maintenance"],
              example: "Available"
            },
            currentLocation: {
              $ref: "#/components/schemas/GeoPoint"
            },
            metadata: {
              $ref: "#/components/schemas/DroneMetadata"
            }
          },
          example: {
            droneId: "drone-003",
            model: "Skydio-X10",
            status: "Available",
            currentLocation: { latitude: 34.05, longitude: -118.24 },
            metadata: {
              firmware: "v2.0.0",
              batteryLevel: 100
            }
          }
        },
        UpdateDroneRequest: {
          type: "object",
          properties: {
            model: { type: "string" },
            status: {
              type: "string",
              enum: ["Available", "Busy", "Maintenance"]
            },
            currentLocation: {
              $ref: "#/components/schemas/GeoPoint"
            },
            lastMaintenance: { type: "string", format: "date-time" },
            lastImageTimestamp: { type: "string", format: "date-time" },
            metadata: {
              $ref: "#/components/schemas/DroneMetadata"
            }
          }
        },
        StatusUpdateRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["Available", "Busy", "Maintenance"]
            }
          }
        },
        DroneImage: {
          type: "object",
          required: ["imageId", "droneId", "timestamp", "s3Uri", "accessLevel"],
          properties: {
            imageId: { type: "string" },
            droneId: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
            s3Uri: { type: "string", example: "s3://bucket/drone-001/image.jpg" },
            accessLevel: {
              type: "string",
              enum: ["user", "admin"]
            },
            metadata: {
              type: "object",
              additionalProperties: {
                type: "string"
              }
            }
          }
        },
        CreateDroneImageRequest: {
          allOf: [{ $ref: "#/components/schemas/DroneImage" }],
          required: ["imageId", "timestamp", "s3Uri", "accessLevel"]
        }
      }
    },
    tags: [
      { name: "Health" },
      { name: "Drones" },
      { name: "Drone Images" },
      { name: "Missions" }
    ],
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            "200": {
              description: "Service is running"
            }
          }
        }
      },
      "/drones": {
        get: {
          tags: ["Drones"],
          summary: "List drones",
          responses: {
            "200": {
              description: "List of drones",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Drone" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ["Drones"],
          summary: "Create drone",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateDroneRequest" }
              }
            }
          },
          responses: {
            "201": {
              description: "Created drone",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/Drone" }
                    }
                  }
                }
              }
            },
            "409": {
              description: "Drone already exists"
            }
          }
        }
      },
      "/drones/{id}": {
        get: {
          tags: ["Drones"],
          summary: "Get drone by ID",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": {
              description: "Drone",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/Drone" }
                    }
                  }
                }
              }
            },
            "404": { description: "Not found" }
          }
        },
        put: {
          tags: ["Drones"],
          summary: "Update drone",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateDroneRequest" }
              }
            }
          },
          responses: {
            "200": {
              description: "Updated drone",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/Drone" }
                    }
                  }
                }
              }
            },
            "404": { description: "Not found" }
          }
        },
        delete: {
          tags: ["Drones"],
          summary: "Delete drone",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "204": { description: "Deleted" },
            "404": { description: "Not found" }
          }
        }
      },
      "/drones/{id}/status": {
        patch: {
          tags: ["Drones"],
          summary: "Update drone status",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StatusUpdateRequest" }
              }
            }
          },
          responses: {
            "204": { description: "No content" },
            "404": { description: "Not found" }
          }
        }
      },
      "/drones/{id}/location": {
        get: {
          tags: ["Drones"],
          summary: "Get drone location snapshot",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": {
              description: "Location",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          droneId: { type: "string" },
                          currentLocation: { $ref: "#/components/schemas/GeoPoint" },
                          status: {
                            type: "string",
                            enum: ["Available", "Busy", "Maintenance"]
                          },
                          updatedAt: { type: "string", format: "date-time" }
                        }
                      }
                    }
                  }
                }
              }
            },
            "404": { description: "Not found" }
          }
        }
      },
      "/drones/{id}/images": {
        get: {
          tags: ["Drone Images"],
          summary: "List drone images",
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } },
            {
              in: "query",
              name: "startAfter",
              required: false,
              schema: { type: "string" }
            },
            {
              in: "query",
              name: "limit",
              required: false,
              schema: { type: "integer", minimum: 1, maximum: 100 }
            }
          ],
          responses: {
            "200": {
              description: "Images",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/DroneImage" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ["Drone Images"],
          summary: "Create drone image metadata",
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateDroneImageRequest" }
              }
            }
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/DroneImage" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/drones/{id}/images/{timestamp}": {
        delete: {
          tags: ["Drone Images"],
          summary: "Delete drone image metadata",
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } },
            { in: "path", name: "timestamp", required: true, schema: { type: "string" } }
          ],
          responses: {
            "204": { description: "Deleted" }
          }
        }
      },
      "/missions": {
        get: {
          tags: ["Missions"],
          summary: "List missions",
          parameters: [
            {
              in: "query",
              name: "droneId",
              required: false,
              schema: { type: "string" },
              description: "Filter missions assigned to a specific drone"
            }
          ],
          responses: {
            "200": {
              description: "List of missions",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Mission" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ["Missions"],
          summary: "Create mission",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["missionId", "assignedDroneId"],
                  properties: {
                    missionId: { type: "string", example: "mission-001" },
                    assignedDroneId: { type: "string", example: "drone-001" },
                    missionType: {
                      type: "string",
                      enum: ["Patrol", "Emergency", "Recon", "Delivery", "SearchAndRescue"]
                    },
                    startTime: { type: "string", format: "date-time" },
                    endTime: { type: "string", format: "date-time" },
                    route: {
                      type: "array",
                      items: { $ref: "#/components/schemas/GeoPoint" }
                    },
                    metadata: { $ref: "#/components/schemas/DroneMetadata" }
                  }
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Created mission",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/Mission" }
                    }
                  }
                }
              }
            },
            "409": { description: "Mission already exists" }
          }
        }
      },
      "/missions/{id}": {
        get: {
          tags: ["Missions"],
          summary: "Get mission by ID",
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } }
          ],
          responses: {
            "200": {
              description: "Mission",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/Mission" }
                    }
                  }
                }
              }
            },
            "404": { description: "Not found" }
          }
        },
        put: {
          tags: ["Missions"],
          summary: "Update mission",
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    assignedDroneId: { type: "string" },
                    missionType: {
                      type: "string",
                      enum: ["Patrol", "Emergency", "Recon", "Delivery", "SearchAndRescue"]
                    },
                    startTime: { type: "string", format: "date-time" },
                    endTime: { type: "string", format: "date-time" },
                    route: {
                      type: "array",
                      items: { $ref: "#/components/schemas/GeoPoint" }
                    },
                    metadata: { $ref: "#/components/schemas/DroneMetadata" }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Updated mission",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/Mission" }
                    }
                  }
                }
              }
            },
            "404": { description: "Not found" }
          }
        },
        delete: {
          tags: ["Missions"],
          summary: "Delete mission",
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } }
          ],
          responses: {
            "204": { description: "Deleted" },
            "404": { description: "Not found" }
          }
        }
      }
    }
  },
  apis: []
};

export const swaggerSpec = swaggerJsdoc(options);

