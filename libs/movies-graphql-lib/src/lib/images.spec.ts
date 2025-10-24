import * as path from "path";
import axios from "axios";
import { writeFile, mkdir } from "fs/promises";
import { importImageFromUrl, storeImageFromUrl } from "./images";
import { jest } from "@jest/globals";

// --- Mocks ---
jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock("fs/promises", () => ({
  __esModule: true,
  writeFile: jest.fn(() => Promise.resolve()),
  mkdir: jest.fn(() => Promise.resolve()),
}));

const axiosGet = axios.get as unknown as jest.MockedFunction<(url: string, config?: any) => Promise<any>>;
const writeFileMock = writeFile as unknown as jest.Mock;
const mkdirMock = mkdir as unknown as jest.Mock;

function fakeAxiosResponse(contentType: string, bytes: number[] = [1, 2, 3]) {
  return {
    data: Uint8Array.from(bytes).buffer,
    headers: { "content-type": contentType },
    status: 200,
    statusText: "OK",
    config: {},
  } as any;
}

describe("images.ts (Jest)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("importImageFromUrl", () => {
    test("throws for non-http(s) URL", async () => {
      await expect(importImageFromUrl("ftp://example.com/x.jpg")).rejects.toThrow(
        /Only http\(s\) URLs/
      );
    });

    test("downloads and returns bytes for image content-type", async () => {
      axiosGet.mockResolvedValueOnce(fakeAxiosResponse("image/jpeg", [10, 20, 30, 40]));

      const res = await importImageFromUrl("https://example.com/pic.jpg");

      expect(res.contentType).toBe("image/jpeg");
      expect(res.size).toBe(4);
      expect(Buffer.isBuffer(res.data)).toBe(true);
      expect(new Uint8Array(res.data)).toEqual(Uint8Array.from([10, 20, 30, 40]));

      expect(axiosGet).toHaveBeenCalledWith(
        "https://example.com/pic.jpg",
        expect.objectContaining({ responseType: "arraybuffer", maxRedirects: 5 })
      );
    });

    test("rejects non-image content-type", async () => {
      axiosGet.mockResolvedValueOnce(fakeAxiosResponse("text/html"));

      await expect(importImageFromUrl("https://example.com/not-image")).rejects.toThrow(
        /does not appear to be an image/
      );
    });
  });

  describe("storeImageFromUrl", () => {
    test("writes the downloaded image with a given filename and returns storedUrl + meta", async () => {
      axiosGet.mockResolvedValueOnce(fakeAxiosResponse("image/png", [1, 2, 3, 4, 5]));

      const uploadDir = path.resolve("uploads/posters");
      const filename = "my-image.png";
      const out = await storeImageFromUrl(
        "https://example.com/img.png",
        uploadDir,
        filename
      );

      const expectedAbs = path.join(uploadDir, filename);

      expect(mkdirMock).toHaveBeenCalledWith(uploadDir, { recursive: true });
      expect(writeFileMock).toHaveBeenCalledWith(expectedAbs, expect.any(Buffer));

      expect(out).toEqual({
        storedUrl: `/uploads/posters/${filename}`,
        contentType: "image/png",
        size: 5,
      });
    });
  });
});
