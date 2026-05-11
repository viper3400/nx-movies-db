import axios from "axios";
import { mkdir, rename, unlink, writeFile } from "fs/promises";
import path from "path";

export function isRemoteHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function storeImageFromUrl(url: string, imagePath: string, movieId: number): Promise<string> {
  const response = await axios.get<ArrayBuffer>(url, {
    responseType: "arraybuffer",
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 400,
  });

  const contentType = (response.headers["content-type"] as string | undefined) ?? "application/octet-stream";
  if (!contentType.startsWith("image/")) {
    throw new Error(`URL does not appear to be an image (content-type: ${contentType})`);
  }

  await mkdir(imagePath, { recursive: true });

  const filename = `${movieId}.jpg`;
  const finalPath = path.join(imagePath, filename);
  const tempPath = path.join(imagePath, `.${filename}.${process.pid}.${Date.now()}.tmp`);

  await writeFile(tempPath, Buffer.from(response.data));
  await rename(tempPath, finalPath);

  return `./${filename}`;
}

async function deleteStoredImage(imagePath: string, movieId: number): Promise<void> {
  try {
    await unlink(path.join(imagePath, `${movieId}.jpg`));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

export async function storeCoverImageFromUrl(url: string, coverImagePath: string, movieId: number): Promise<string> {
  return storeImageFromUrl(url, coverImagePath, movieId);
}

export async function storePosterImageFromUrl(url: string, posterImagePath: string, movieId: number): Promise<string> {
  return storeImageFromUrl(url, posterImagePath, movieId);
}

export async function deleteStoredCoverImage(coverImagePath: string, movieId: number): Promise<void> {
  return deleteStoredImage(coverImagePath, movieId);
}

export async function deleteStoredPosterImage(posterImagePath: string, movieId: number): Promise<void> {
  return deleteStoredImage(posterImagePath, movieId);
}
