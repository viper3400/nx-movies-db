// Define the interface for a single movie
export interface Movie {
  id: string;
  title: string;
  subtitle: string;
  diskid?: string; // Optional
  mediaType: string;
  genres: string[];
  ownerid: number;
  istv: boolean;
  plot: string;
}
