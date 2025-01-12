"use client";

import { useState, useEffect } from "react";
import { getMoviesById } from "../app/services/actions/getMoviesById";

interface DetailsComponentProperties {
  id: string
}
export const DetailsComponent = ({ id }: DetailsComponentProperties) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const fetchedMovie = await getMoviesById(id, "INCLUDE_DELETED");
        setMovie(fetchedMovie);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div>
      <h1>Details Component</h1>
      <p>Movie ID: {id}</p>
      {movie && <p>Movie Details: {JSON.stringify(movie)}</p>}
    </div>
  );
};
