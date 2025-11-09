import dotenv from "dotenv";
import { S3Client } from "@aws-sdk/client-s3";

dotenv.config();

const region = process.env.AWS_REGION ?? "us-east-1";

export const s3Client = new S3Client({
  region,
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ""
      }
    : undefined
});

export const CAMERA_S3_BUCKET = process.env.CAMERA_S3_BUCKET ?? "";


