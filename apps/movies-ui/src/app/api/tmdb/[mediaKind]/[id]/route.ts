import { getAllowedSession } from "../../../../services/actions/getAllowedSession";
import { getTmdbMovieMetadataResult } from "../../../../services/actions/tmdbMetadata";
import type { TmdbMediaKind } from "../../../../services/actions/tmdbMetadataMapper";

function isTmdbMediaKind(value: string): value is TmdbMediaKind {
  return value === "movie" || value === "tv";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ mediaKind: string; id: string }> }
) {
  const session = await getAllowedSession();
  if (!session?.eMail) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mediaKind, id } = await params;
  if (!isTmdbMediaKind(mediaKind)) {
    return Response.json({ error: "Invalid TMDB media kind." }, { status: 400 });
  }

  const tmdbId = Number(id);
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return Response.json({ error: "Invalid TMDB id." }, { status: 400 });
  }

  const result = await getTmdbMovieMetadataResult(tmdbId, mediaKind);
  if (result.error) {
    return Response.json({ error: result.error }, { status: 502 });
  }

  return Response.json(result.movie, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
