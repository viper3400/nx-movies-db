"use server";

import { gql, type TypedDocumentNode } from "@apollo/client";
import { getClient } from "../../../lib/apollocient";
import type { VideoData } from "@nx-movies-db/shared-types";

type RawVideoData = {
  id: number;
  md5?: string | null;
  title?: string | null;
  subtitle?: string | null;
  language?: string | null;
  diskid?: string | null;
  comment?: string | null;
  disklabel?: string | null;
  imdbID?: string | null;
  year: number | null;
  imgurl?: string | null;
  director?: string | null;
  actors?: string | null;
  runtime?: number | null;
  country?: string | null;
  plot?: string | null;
  rating?: string | null;
  filename?: string | null;
  filesize?: string | number | null;
  filedate?: string | null;
  audio_codec?: string | null;
  video_codec?: string | null;
  video_width?: number | null;
  video_height?: number | null;
  istv: number | null;
  lastupdate?: string | null;
  mediatype: number | null;
  custom1?: string | null;
  custom2?: string | null;
  custom3?: string | null;
  custom4?: string | null;
  created?: string | null;
  owner_id: number | null;
  videodb_videogenre?: Array<{ genre_id: number }>;
};

type VideoDataResult = {
  videoData: RawVideoData | null;
};

const getVideoDataQuery: TypedDocumentNode<VideoDataResult, { id: number }> = gql`
  query VideoData($id: Int!) {
    videoData(id: $id) {
      id
      md5
      title
      subtitle
      language
      diskid
      comment
      disklabel
      imdbID
      year
      imgurl
      director
      actors
      runtime
      country
      plot
      rating
      filename
      filesize
      filedate
      audio_codec
      video_codec
      video_width
      video_height
      istv
      lastupdate
      mediatype
      custom1
      custom2
      custom3
      custom4
      created
      owner_id
      videodb_videogenre {
        genre_id
      }
    }
  }
`;

const safeDate = (value: string | null | undefined) => (value ? new Date(value) : null);

export async function getVideoData(id: number): Promise<VideoData | undefined> {
  const { data } = await getClient().query({
    query: getVideoDataQuery,
    variables: { id },
    fetchPolicy: "no-cache",
  });

  if (!data?.videoData) {
    return undefined;
  }

  const v = data.videoData;

  return {
    id: v.id,
    md5: v.md5,
    title: v.title,
    subtitle: v.subtitle,
    language: v.language,
    diskid: v.diskid,
    comment: v.comment,
    disklabel: v.disklabel,
    imdbID: v.imdbID,
    year: v.year,
    imgurl: v.imgurl,
    director: v.director,
    actors: v.actors,
    runtime: v.runtime,
    country: v.country,
    plot: v.plot,
    rating: v.rating,
    filename: v.filename,
    filesize: v.filesize ? Number(v.filesize) : null,
    filedate: safeDate(v.filedate ?? null),
    audio_codec: v.audio_codec,
    video_codec: v.video_codec,
    video_width: v.video_width,
    video_height: v.video_height,
    istv: v.istv,
    lastupdate: safeDate(v.lastupdate ?? null),
    mediatype: v.mediatype,
    custom1: v.custom1,
    custom2: v.custom2,
    custom3: v.custom3,
    custom4: v.custom4,
    created: safeDate(v.created ?? null),
    owner_id: v.owner_id,
    genreIds: v.videodb_videogenre?.map((vg) => vg.genre_id) ?? [],
  };
}
