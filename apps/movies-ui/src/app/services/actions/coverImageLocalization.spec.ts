import axios from "axios";
import { mkdir, rename, writeFile } from "fs/promises";
import path from "path";
import { isRemoteHttpUrl, storeCoverImageFromUrl } from "./coverImageLocalization";

jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock("fs/promises", () => ({
  __esModule: true,
  mkdir: jest.fn(() => Promise.resolve()),
  rename: jest.fn(() => Promise.resolve()),
  writeFile: jest.fn(() => Promise.resolve()),
}));

const axiosGet = axios.get as jest.MockedFunction<(url: string, config?: unknown) => Promise<any>>;
const mkdirMock = mkdir as jest.MockedFunction<typeof mkdir>;
const renameMock = rename as jest.MockedFunction<typeof rename>;
const writeFileMock = writeFile as jest.MockedFunction<typeof writeFile>;

function fakeAxiosResponse(contentType: string, bytes: number[] = [1, 2, 3]) {
  return {
    data: Uint8Array.from(bytes).buffer,
    headers: { "content-type": contentType },
  };
}

describe("cover image localization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, "now").mockReturnValue(123456789);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("isRemoteHttpUrl", () => {
    it("accepts http and https URLs only", () => {
      expect(isRemoteHttpUrl("https://example.com/cover.jpg")).toBe(true);
      expect(isRemoteHttpUrl("http://example.com/cover.jpg")).toBe(true);
      expect(isRemoteHttpUrl("./123.jpg")).toBe(false);
      expect(isRemoteHttpUrl("ftp://example.com/cover.jpg")).toBe(false);
      expect(isRemoteHttpUrl("not a url")).toBe(false);
      expect(isRemoteHttpUrl(null)).toBe(false);
    });
  });

  describe("storeCoverImageFromUrl", () => {
    it("downloads an image and stores it as the movie jpg filename", async () => {
      axiosGet.mockResolvedValueOnce(fakeAxiosResponse("image/png", [10, 20, 30]));

      const coverImagePath = path.resolve("coverpics");
      const storedUrl = await storeCoverImageFromUrl("https://example.com/cover.png", coverImagePath, 530);

      expect(axiosGet).toHaveBeenCalledWith(
        "https://example.com/cover.png",
        expect.objectContaining({
          responseType: "arraybuffer",
          maxRedirects: 5,
        })
      );
      expect(mkdirMock).toHaveBeenCalledWith(coverImagePath, { recursive: true });
      expect(writeFileMock).toHaveBeenCalledWith(
        path.join(coverImagePath, `.530.jpg.${process.pid}.123456789.tmp`),
        expect.any(Buffer)
      );
      expect(renameMock).toHaveBeenCalledWith(
        path.join(coverImagePath, `.530.jpg.${process.pid}.123456789.tmp`),
        path.join(coverImagePath, "530.jpg")
      );
      expect(storedUrl).toBe("./530.jpg");
    });

    it("rejects non-image responses", async () => {
      axiosGet.mockResolvedValueOnce(fakeAxiosResponse("text/html"));

      await expect(
        storeCoverImageFromUrl("https://example.com/not-image", "/covers", 530)
      ).rejects.toThrow(/does not appear to be an image/);

      expect(writeFileMock).not.toHaveBeenCalled();
      expect(renameMock).not.toHaveBeenCalled();
    });
  });
});
