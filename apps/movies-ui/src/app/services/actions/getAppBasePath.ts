"use server"

export async function getAppBasePath() {
  return Promise.resolve(process.env.APP_BASE_PATH ?? "");
}
