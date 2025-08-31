import { useEffect, useState } from "react";
import { getMediaTypes, getGenres } from "../app/services/actions";

export function useAvailableMediaAndGenres() {
  const [availableMediaTypes, setAvailableMediaTypes] = useState<{ label: string; value: string }[]>([]);
  const [availableGenres, setAvailableGenres] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const fetchMediaTypes = async () => {
      const data = await getMediaTypes();
      setAvailableMediaTypes(
        data.mediaTypes.map((mt) => ({
          label: mt.name,
          value: String(mt.id),
        }))
      );
    };
    const fetchGenres = async () => {
      const data = await getGenres();
      setAvailableGenres(
        data.genres.map((g) => ({
          label: g.name,
          value: String(g.id),
        }))
      );
    };
    fetchMediaTypes();
    fetchGenres();
  }, []);

  return { availableMediaTypes, availableGenres };
}
