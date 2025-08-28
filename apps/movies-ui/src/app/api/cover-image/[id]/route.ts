import fs from "fs";
import { NextRequest } from "next/server";
import path from "path";
import { auth } from "../../../../lib/auth";
import { isUserAllowed } from "../../../../lib/allowed-user-parser";

const coverImagePath = process.env.COVER_IMAGE_PATH || process.cwd();

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/cover-image/[id]'>) {
  const session = await auth();
  if (!session?.user?.email || !isUserAllowed(session.user?.email)) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { id } = await ctx.params;

  let imagePath = path.join(coverImagePath, `${id}.jpg`);
  try {
    // Check if the image file exists
    await fs.promises.access(imagePath, fs.constants.F_OK);

  } catch (error) {

    console.error("image not found fallback");
    //https://www.dummyimage.com/
    imagePath = path.join(coverImagePath, "not_found.jpg");
  }

  // Create a manual Web Stream from the file
  const stream = fs.createReadStream(imagePath);

  const readableStream = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => controller.enqueue(chunk));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
  });

  return new Response(readableStream, {
    status: 200,
    headers: { "Content-Type": "image/jpeg" },
  });
}
