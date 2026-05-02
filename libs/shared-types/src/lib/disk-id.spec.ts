import {
  getDiskIdShelfPrefix,
  isPhysicalMediaTypeName,
  isValidDiskId,
  isValidDiskIdShelfPrefix,
  normalizeDiskId,
} from "./disk-id";

describe("disk ID rules", () => {
  it("accepts valid full disk IDs", () => {
    expect(isValidDiskId("R01F3D01")).toBe(true);
    expect(isValidDiskId("R01F12D09")).toBe(true);
  });

  it("normalizes disk IDs before validation", () => {
    expect(normalizeDiskId(" r01f3d01 ")).toBe("R01F3D01");
    expect(isValidDiskId(" r01f3d01 ")).toBe(true);
  });

  it("rejects partial, wrong-width, and malformed disk IDs", () => {
    expect(isValidDiskId("XR01F3D01")).toBe(false);
    expect(isValidDiskId("R1F3D01")).toBe(false);
    expect(isValidDiskId("R01F123D01")).toBe(false);
    expect(isValidDiskId("R01F3D1")).toBe(false);
    expect(isValidDiskId("R01F3")).toBe(false);
  });

  it("extracts valid shelf prefixes from prefixes and full disk IDs", () => {
    expect(isValidDiskIdShelfPrefix("R01F3")).toBe(true);
    expect(getDiskIdShelfPrefix("R01F3")).toBe("R01F3");
    expect(getDiskIdShelfPrefix("R01F3D04")).toBe("R01F3");
    expect(getDiskIdShelfPrefix("bad")).toBeNull();
  });

  it("classifies physical media type names", () => {
    expect(isPhysicalMediaTypeName("DVD")).toBe(true);
    expect(isPhysicalMediaTypeName("Blu-ray")).toBe(true);
    expect(isPhysicalMediaTypeName("Netflix")).toBe(false);
    expect(isPhysicalMediaTypeName("HDD")).toBe(false);
    expect(isPhysicalMediaTypeName("wanted")).toBe(false);
  });
});
