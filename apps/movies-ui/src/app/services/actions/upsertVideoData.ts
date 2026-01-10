"use server";

import { gql, type TypedDocumentNode } from "@apollo/client";
import { getClient } from "../../../lib/apollocient";
import type { UpsertVideoDataFormValues } from "@nx-movies-db/shared-ui";

type UpsertResult = {
  upsertVideoData: {
    id: number;
    title: string | null;
    imdbID: string | null;
  };
};

type UpsertVariables = Partial<{
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
    $year: Int,
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
    $istv: Int,
    $lastupdate: DateTime,
    $mediatype: Int,
    $custom1: String,
    $custom2: String,
    $custom3: String,
    $custom4: String,
    $created: DateTime,
    $owner_id: Int,
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
  const v: UpsertVariables = {};
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
    (v as any).mediatype = 1;
  }

  return v;
}

export async function upsertVideoData(values: UpsertVideoDataFormValues) {
  const client = getClient();
  const variables = mapToVariables(values);
  const { data, error } = await client.mutate<UpsertResult, UpsertVariables>({
    mutation: UPSERT_MUTATION,
    variables,
  });
  /* TODO: Do we really want to do this here? We have to respect existing images, override?
  if (variables.imgurl && process.env.COVER_IMAGE_PATH)
    await storeImageFromUrl(variables.imgurl, process.env.COVER_IMAGE_PATH, data?.upsertVideoData.id + ".jpg");
  */
  if (error) {
    throw new Error(error.message);
  }
  return data?.upsertVideoData;
}
