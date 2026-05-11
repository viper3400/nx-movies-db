"use server";

import { gql, type TypedDocumentNode } from "@apollo/client";
import { getClient } from "../../../lib/apollocient";
import type { UpsertVideoDataFormValues } from "@nx-movies-db/shared-ui";
import {
  deleteStoredCoverImage,
  deleteStoredPosterImage,
  isRemoteHttpUrl,
  storeCoverImageFromUrl,
  storePosterImageFromUrl,
} from "./coverImageLocalization";
import { getVideoData } from "./getVideoData";

type UpsertResult = {
  upsertVideoData: {
    id: number;
    title: string | null;
    imdbID: string | null;
  };
};

type OptionalUpsertFields = Partial<{
  id: number;
  md5: string;
  title: string;
  subtitle: string;
  language: string;
  diskid: string;
  comment: string;
  disklabel: string;
  imdbID: string;
  year: number;
  imgurl: string;
  director: string;
  actors: string;
  runtime: number;
  country: string;
  plot: string;
  rating: string;
  filename: string;
  filesize: any; // GraphQL BigInt scalar
  filedate: Date;
  audio_codec: string;
  video_codec: string;
  video_width: number;
  video_height: number;
  istv: number;
  lastupdate: Date;
  mediatype: number;
  custom1: string;
  custom2: string;
  custom3: string;
  custom4: string;
  created: Date;
  owner_id: number;
  genreIds: number[];
}>;

type UpsertVariables = OptionalUpsertFields & {
  year: number;
  istv: number;
  mediatype: number;
  owner_id: number;
};

const UPSERT_MUTATION: TypedDocumentNode<UpsertResult, UpsertVariables> = gql`
  mutation UpsertVideoData(
    $id: Int,
    $md5: String,
    $title: String,
    $subtitle: String,
    $language: String,
    $diskid: String,
    $comment: String,
    $disklabel: String,
    $imdbID: String,
    $year: Int!,
    $imgurl: String,
    $director: String,
    $actors: String,
    $runtime: Int,
    $country: String,
    $plot: String,
    $rating: String,
    $filename: String,
    $filesize: BigInt,
    $filedate: DateTime,
    $audio_codec: String,
    $video_codec: String,
    $video_width: Int,
    $video_height: Int,
    $istv: Int!,
    $lastupdate: DateTime,
    $mediatype: Int!,
    $custom1: String,
    $custom2: String,
    $custom3: String,
    $custom4: String,
    $created: DateTime,
    $owner_id: Int!,
    $genreIds: [Int!]
  ) {
    upsertVideoData(
      id: $id,
      md5: $md5,
      title: $title,
      subtitle: $subtitle,
      language: $language,
      diskid: $diskid,
      comment: $comment,
      disklabel: $disklabel,
      imdbID: $imdbID,
      year: $year,
      imgurl: $imgurl,
      director: $director,
      actors: $actors,
      runtime: $runtime,
      country: $country,
      plot: $plot,
      rating: $rating,
      filename: $filename,
      filesize: $filesize,
      filedate: $filedate,
      audio_codec: $audio_codec,
      video_codec: $video_codec,
      video_width: $video_width,
      video_height: $video_height,
      istv: $istv,
      lastupdate: $lastupdate,
      mediatype: $mediatype,
      custom1: $custom1,
      custom2: $custom2,
      custom3: $custom3,
      custom4: $custom4,
      created: $created,
      owner_id: $owner_id,
      genreIds: $genreIds
    ) {
      id
      title
      imdbID
    }
  }
`;

function mapToVariables(values: UpsertVideoDataFormValues): UpsertVariables {
  const v: OptionalUpsertFields = {};
  const entries = Object.entries(values) as Array<[
    keyof UpsertVideoDataFormValues,
    UpsertVideoDataFormValues[keyof UpsertVideoDataFormValues]
  ]>;

  for (const [key, val] of entries) {
    if (val === undefined || val === null || val === "") continue;

    // Normalize Date fields to ISO strings (GraphQL DateTime)
    if ((key === "filedate" || key === "lastupdate" || key === "created") && val instanceof Date) {
      (v as any)[key] = val.toISOString();
      continue;
    }

    // Normalize BigInt-like fields to string for GraphQL BigInt scalar
    if (key === "filesize") {
      // Guard: we already filtered out null/undefined/empty above
      (v as any)[key] = String(val as any);
      continue;
    }

    (v as any)[key] = val as any;
  }

  // Ensure required foreign key references are valid
  if (v.mediatype === undefined) {
    // Fallback to a known valid media type id
    v.mediatype = 1;
  }

  const requiredMessages: Record<keyof Pick<UpsertVariables, "year" | "istv" | "mediatype" | "owner_id">, string> = {
    year: "Bitte das Erscheinungsjahr angeben.",
    istv: "Bitte angeben, ob es sich um einen TV-Inhalt handelt (0 oder 1).",
    mediatype: "Bitte einen Medientyp auswählen.",
    owner_id: "Bitte einen Besitzer auswählen.",
  };

  (["year", "istv", "mediatype", "owner_id"] as const).forEach((key) => {
    const value = (v as UpsertVariables)[key];
    if (value === undefined || value === null) {
      throw new Error(requiredMessages[key]);
    }
  });

  return v as UpsertVariables;
}

export async function upsertVideoData(values: UpsertVideoDataFormValues) {
  const client = getClient();
  const variables = mapToVariables(values);
  const existingVideo = values.id ? await getVideoData(values.id) : undefined;

  const { data, error } = await client.mutate<UpsertResult, UpsertVariables>({
    mutation: UPSERT_MUTATION,
    variables,
  });

  if (error) {
    throw new Error(error.message);
  }

  const savedVideo = data?.upsertVideoData;
  if (!savedVideo?.id) {
    return savedVideo;
  }

  let latestSavedVideo = savedVideo;

  if (isRemoteHttpUrl(variables.imgurl)) {
    const coverImagePath = process.env.COVER_IMAGE_PATH;
    if (!coverImagePath) {
      console.error("Skipping cover image localization: COVER_IMAGE_PATH is not configured", {
        movieId: savedVideo.id,
        imgurl: variables.imgurl,
      });
    } else {
      try {
        const localizedImgurl = await storeCoverImageFromUrl(variables.imgurl, coverImagePath, savedVideo.id);
        const localizedVariables: UpsertVariables = {
          ...variables,
          id: savedVideo.id,
          imgurl: localizedImgurl,
          custom3: variables.imgurl,
        };

        const localizedResult = await client.mutate<UpsertResult, UpsertVariables>({
          mutation: UPSERT_MUTATION,
          variables: localizedVariables,
        });

        if (localizedResult.error) {
          throw new Error(localizedResult.error.message);
        }

        latestSavedVideo = localizedResult.data?.upsertVideoData ?? latestSavedVideo;
      } catch (error) {
        try {
          await deleteStoredCoverImage(coverImagePath, savedVideo.id);
        } catch (deleteError) {
          console.error("Failed to remove stale local cover image after localization failure", {
            movieId: savedVideo.id,
            error: deleteError instanceof Error ? deleteError.message : deleteError,
          });
        }

        console.error("Cover image localization failed after metadata save", {
          movieId: savedVideo.id,
          imgurl: variables.imgurl,
          error: error instanceof Error ? error.message : error,
        });
      }
    }
  }

  const posterSourceChanged = existingVideo?.custom4 !== variables.custom4;
  if (!isRemoteHttpUrl(variables.custom4) || (!existingVideo && !variables.custom4) || !posterSourceChanged) {
    return latestSavedVideo;
  }

  const posterImagePath = process.env.POSTER_IMAGE_PATH;
  if (!posterImagePath) {
    console.error("Skipping poster image localization: POSTER_IMAGE_PATH is not configured", {
      movieId: savedVideo.id,
      custom4: variables.custom4,
    });
    return latestSavedVideo;
  }

  try {
    await storePosterImageFromUrl(variables.custom4, posterImagePath, savedVideo.id);
  } catch (error) {
    try {
      await deleteStoredPosterImage(posterImagePath, savedVideo.id);
    } catch (deleteError) {
      console.error("Failed to remove stale local poster image after localization failure", {
        movieId: savedVideo.id,
        error: deleteError instanceof Error ? deleteError.message : deleteError,
      });
    }

    console.error("Poster image localization failed after metadata save", {
      movieId: savedVideo.id,
      custom4: variables.custom4,
      error: error instanceof Error ? error.message : error,
    });
  }

  return latestSavedVideo;
}
