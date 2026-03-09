/**
 * Cloudflare R2 client — S3-compatible object storage.
 * Used for audio recordings, images, and other binary assets.
 * 
 * Env vars required:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID || "";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
const bucketName = process.env.R2_BUCKET_NAME || "agora-assets";

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.warn(
    "R2 env vars missing (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY). File uploads will fail."
  );
}

/** Cloudflare R2 S3-compatible client */
export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/**
 * Upload a buffer/blob to R2.
 * @returns The storage key used.
 */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array | ReadableStream,
  contentType: string
): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return key;
}

/**
 * Generate a presigned GET URL (valid for 1 hour by default).
 */
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

/**
 * Generate a presigned PUT URL for direct client uploads.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

/**
 * Delete an object from R2.
 */
export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  );
}

/**
 * Check if an object exists in R2.
 */
export async function existsInR2(key: string): Promise<boolean> {
  try {
    await r2.send(
      new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Build the public URL for an R2 object (if bucket has public access enabled).
 * If not, use getPresignedUrl() instead.
 */
export function getPublicR2Url(key: string): string {
  // If you have a custom domain for R2 public access:
  const publicDomain = process.env.R2_PUBLIC_DOMAIN;
  if (publicDomain) {
    return `https://${publicDomain}/${key}`;
  }
  // Otherwise fall back to presigned URLs (handled at API level)
  return "";
}

/**
 * Generate a unique storage key for a file.
 */
export function generateStorageKey(
  userId: string,
  projectId: string,
  fileName: string,
  type: "audio" | "image" | "document" = "audio"
): string {
  const timestamp = Date.now();
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${type}/${userId}/${projectId}/${timestamp}_${sanitized}`;
}
