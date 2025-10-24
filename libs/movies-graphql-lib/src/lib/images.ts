import axios from "axios";
import { writeFile, mkdir } from "fs/promises";
import * as path from "path";

export interface ImportedImage {
  data: Buffer;
  contentType: string;
  size: number;
}

/**
 * Simple image import: validate http(s) URL, download bytes with axios, ensure it's an image.
 * Returns the raw bytes and content-type so callers can store it (disk, S3, etc.).
 */
export async function importImageFromUrl(url: string): Promise<ImportedImage> {
  // Basic validation
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
    throw new Error("Only http(s) URLs are supported");
  }

  // Fetch image using existing dependency (axios)
  const res = await axios.get<ArrayBuffer>(url, {
    responseType: "arraybuffer",
    maxRedirects: 5,
    // Consider 2xx and 3xx (for axios follow-ups) as ok
    validateStatus: (status) => status >= 200 && status < 400,
  });

  const contentType = (res.headers["content-type"] as string | undefined) ?? "application/octet-stream";
  if (!contentType.startsWith("image/")) {
    throw new Error(`URL does not appear to be an image (content-type: ${contentType})`);
  }

  const data = Buffer.from(res.data);
  return { data, contentType, size: data.length };
}

export async function storeImageFromUrl(url: string, uploadDir: string, filename: string) {
  const img = await importImageFromUrl(url);

  await mkdir(uploadDir, { recursive: true });

  const absPath = path.join(uploadDir, filename);

  await writeFile(absPath, img.data);

  return {
    storedUrl: `/uploads/posters/${filename}`,
    contentType: img.contentType,
    size: img.size,
  };
}
