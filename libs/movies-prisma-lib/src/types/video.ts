export type Video = {
  id: number;
  subtitle?: string | null;
  title?: string | null;
  diskid?: string | null;
  owner_id: number;
  istv: number;
  runtime: number | null;
  rating: string | null;
  plot?: string | null;
  videodb_videogenre?: {
    genre: {
      name: string;
    };
  }[] | null;
  videodb_mediatypes?: {
    name: string;
  } | null;
  userMovieSettings?: {
    is_favorite: boolean;
    watchagain: boolean;
    asp_username: string;
  }[] | null
};
