import { readFileSync } from "node:fs";
import { join } from "node:path";

export type VersionMetadata = {
  appVersion: string;
};

let cachedPackageVersion: string | null = null;

const FALLBACK_VERSION = "dev";

function readPackageVersion(): string {
  if (cachedPackageVersion) {
    return cachedPackageVersion;
  }

  try {
    const pkgRaw = readFileSync(join(process.cwd(), "package.json"), "utf-8");
    const parsed = JSON.parse(pkgRaw) as { version?: string };
    cachedPackageVersion = parsed.version ?? FALLBACK_VERSION;
  } catch {
    cachedPackageVersion = FALLBACK_VERSION;
  }

  return cachedPackageVersion;
}

export function getVersionMetadata(): VersionMetadata {
  const appVersion = process.env.APP_VERSION ?? readPackageVersion();

  return {
    appVersion,
  };
}
