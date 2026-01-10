// Shared representation of videodb_videodata for form/edit usage
// Mirrors Prisma model field names and types, with nullables optional.

export type VideoData = {
  id: number | null;
  md5?: string | null;
  title?: string | null;
  subtitle?: string | null;
  language?: string | null;
  diskid?: string | null;
  comment?: string | null;
  disklabel?: string | null;
  imdbID?: string | null;
  year: number | null; // Prisma default 0
  imgurl?: string | null;
  director?: string | null;
  actors?: string | null;
  runtime?: number | null;
  country?: string | null;
  plot?: string | null;
  rating?: string | null;
  filename?: string | null;
  filesize?: number | null;
  filedate?: Date | null;
  audio_codec?: string | null;
  video_codec?: string | null;
  video_width?: number | null;
  video_height?: number | null;
  istv: number | null; // 0/1
  lastupdate: Date | null;
  mediatype: number | null;
  custom1?: string | null;
  custom2?: string | null;
  custom3?: string | null;
  custom4?: string | null;
  created?: Date | null;
  owner_id: number | null;
  genreIds?: number[] | null;
};
