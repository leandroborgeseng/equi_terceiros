import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.S3_ENDPOINT;
const bucket = process.env.S3_BUCKET ?? "equipamentos-docs";
const region = process.env.S3_REGION ?? "auto";

function getS3Client() {
  if (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_KEY) {
    return null;
  }
  return new S3Client({
    region,
    endpoint: endpoint || undefined,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
    forcePathStyle: !!endpoint,
  });
}

export function isS3Configured() {
  return !!(process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY);
}

export async function getUploadPresignedUrl(params: {
  key: string;
  contentType: string;
  expiresIn?: number;
}) {
  const client = getS3Client();
  if (!client) {
    return { url: null, useLocal: true };
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: params.key,
    ContentType: params.contentType,
  });

  const url = await getSignedUrl(client, command, {
    expiresIn: params.expiresIn ?? 3600,
  });

  return { url, useLocal: false, key: params.key };
}

export async function getDownloadPresignedUrl(key: string, expiresIn = 3600) {
  const client = getS3Client();
  if (!client) return null;

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn });
}

export async function deleteObject(key: string) {
  const client = getS3Client();
  if (!client) return;
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export function buildStorageKey(params: {
  requestId: string;
  type: string;
  fileName: string;
}) {
  const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `requests/${params.requestId}/${params.type}/${Date.now()}-${safeName}`;
}
