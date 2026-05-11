import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { auth } from "../../../../lib/auth";
import { isUserAllowed } from "../../../../lib/allowed-user-parser";

const posterImagePath = process.env.POSTER_IMAGE_PATH || process.cwd();

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/poster-image/[id]">) {
  const session = await auth();
  if (!session?.user?.email || !isUserAllowed(session.user.email)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { id } = await ctx.params;
  let imagePath = path.join(posterImagePath, `${id}.jpg`);

  try {
    await fs.promises.access(imagePath, fs.constants.F_OK);
  } catch {
    imagePath = path.join(posterImagePath, "not_found.jpg");
  }

  const stream = fs.createReadStream(imagePath);
  const readableStream = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => controller.enqueue(chunk));
      stream.on("end", () => controller.close());
      stream.on("error", (error) => controller.error(error));
    },
  });

  return new Response(readableStream, {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
