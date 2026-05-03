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

export async function storeCoverImageFromUrl(url: string, coverImagePath: string, movieId: number): Promise<string> {
  const response = await axios.get<ArrayBuffer>(url, {
    responseType: "arraybuffer",
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 400,
  });

  const contentType = (response.headers["content-type"] as string | undefined) ?? "application/octet-stream";
  if (!contentType.startsWith("image/")) {
    throw new Error(`URL does not appear to be an image (content-type: ${contentType})`);
  }

  await mkdir(coverImagePath, { recursive: true });

  const filename = `${movieId}.jpg`;
  const finalPath = path.join(coverImagePath, filename);
  const tempPath = path.join(coverImagePath, `.${filename}.${process.pid}.${Date.now()}.tmp`);

  await writeFile(tempPath, Buffer.from(response.data));
  await rename(tempPath, finalPath);

  return `./${filename}`;
}

export async function deleteStoredCoverImage(coverImagePath: string, movieId: number): Promise<void> {
  try {
    await unlink(path.join(coverImagePath, `${movieId}.jpg`));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
