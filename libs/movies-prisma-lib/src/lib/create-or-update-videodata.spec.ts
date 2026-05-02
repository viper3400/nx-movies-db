import { describe, expect, it } from "@jest/globals";
import {
  parseVideoDataInput,
  type VideoDataInput,
  validateDiskIdForPersistence,
  VideoDataValidationError,
  upsertVideoData,
} from "./create-or-update-videodata";

const baseVideo = (): VideoDataInput => ({
  title: "Validation Fixture",
  year: 2024,
  mediatype: 1,
  owner_id: 1,
  istv: 0,
  lastupdate: new Date("2024-01-01T00:00:00Z"),
});

describe("parseVideoDataInput", () => {
  it("accepts valid payloads and leaves optional metadata intact", () => {
    const created = "2024-01-02T00:00:00Z";
    const parsed = parseVideoDataInput({
      ...baseVideo(),
      created,
      filedate: new Date("2024-01-03T00:00:00Z"),
      genreIds: [2, 3, 3],
    });

    expect(parsed.created).toBe(created);
    expect(parsed.genreIds).toEqual([2, 3, 3]);
  });

  it("throws a VideoDataValidationError when required integer fields are missing", () => {
    expect(() =>
      parseVideoDataInput({
        ...baseVideo(),
        owner_id: undefined as unknown as number,
      })
    ).toThrow(VideoDataValidationError);
  });

  it("throws when genreIds contains invalid identifiers", () => {
    expect(() =>
      parseVideoDataInput({
        ...baseVideo(),
        genreIds: [1, -5] as number[],
      })
    ).toThrow(VideoDataValidationError);
  });
});

describe("upsertVideoData validation boundary", () => {
  it("rejects invalid payloads before reaching Prisma", async () => {
    await expect(
      upsertVideoData({
        ...baseVideo(),
        genreIds: [-1] as number[],
      })
    ).rejects.toBeInstanceOf(VideoDataValidationError);
  });
});

describe("validateDiskIdForPersistence", () => {
  it("requires disk IDs for physical media types", async () => {
    await expect(validateDiskIdForPersistence(baseVideo())).rejects.toBeInstanceOf(
      VideoDataValidationError
    );
  });

  it("allows missing disk IDs for non-physical media types", async () => {
    await expect(
      validateDiskIdForPersistence({
        ...baseVideo(),
        mediatype: 2,
      })
    ).resolves.toEqual(expect.objectContaining({ diskid: undefined }));
  });

  it("rejects invalid non-empty disk IDs for all media types", async () => {
    await expect(
      validateDiskIdForPersistence({
        ...baseVideo(),
        mediatype: 2,
        diskid: "R1F3D01",
      })
    ).rejects.toBeInstanceOf(VideoDataValidationError);
  });

  it("rejects duplicate disk IDs but allows the current record to keep its disk ID", async () => {
    await expect(
      validateDiskIdForPersistence({
        ...baseVideo(),
        diskid: "R09F5D13",
      })
    ).rejects.toBeInstanceOf(VideoDataValidationError);

    await expect(
      validateDiskIdForPersistence({
        ...baseVideo(),
        id: 11,
        diskid: "R09F5D13",
      })
    ).resolves.toEqual(expect.objectContaining({ diskid: "R09F5D13" }));
  });

  it("normalizes disk IDs before persistence", async () => {
    await expect(
      validateDiskIdForPersistence({
        ...baseVideo(),
        diskid: " r99f9d01 ",
      })
    ).resolves.toEqual(expect.objectContaining({ diskid: "R99F9D01" }));
  });
});
