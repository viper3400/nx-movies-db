import { useEffect, useState } from "react";
import { getMediaTypes, getGenres } from "../app/services/actions";

type Option = { label: string; value: string };

let mediaTypesCache: Option[] | null = null;
let genresCache: Option[] | null = null;
let mediaTypesPromise: Promise<Option[]> | null = null;
let genresPromise: Promise<Option[]> | null = null;
let mediaTypesErrorCache: Error | null = null;
let genresErrorCache: Error | null = null;

const fetchMediaTypesOnce = async (): Promise<Option[]> => {
  const response = await getMediaTypes();
  return response.mediaTypes.map((mt) => ({
    label: mt.name,
    value: String(mt.id),
  }));
};

const fetchGenresOnce = async (): Promise<Option[]> => {
  const response = await getGenres();
  return response.genres.map((g) => ({
    label: g.name,
    value: String(g.id),
  }));
};

export function useAvailableMediaAndGenres() {
  const [availableMediaTypes, setAvailableMediaTypes] = useState<Option[]>(mediaTypesCache ?? []);
  const [availableGenres, setAvailableGenres] = useState<Option[]>(genresCache ?? []);
  const [loadingMediaTypes, setLoadingMediaTypes] = useState<boolean>(!mediaTypesCache);
  const [loadingGenres, setLoadingGenres] = useState<boolean>(!genresCache);
  const [mediaTypesError, setMediaTypesError] = useState<Error | null>(mediaTypesErrorCache);
  const [genresError, setGenresError] = useState<Error | null>(genresErrorCache);

  useEffect(() => {
    let cancelled = false;

    if (!mediaTypesCache) {
      if (!mediaTypesPromise) {
        mediaTypesPromise = fetchMediaTypesOnce()
          .then((options) => {
            mediaTypesCache = options;
            mediaTypesErrorCache = null;
            return options;
          })
          .catch((err) => {
            mediaTypesErrorCache = err instanceof Error ? err : new Error("Failed to load media types");
            throw mediaTypesErrorCache;
          })
          .finally(() => {
            mediaTypesPromise = null;
          });
      }

      setLoadingMediaTypes(true);
      mediaTypesPromise
        ?.then((options) => {
          if (cancelled) return;
          setAvailableMediaTypes(options);
          setMediaTypesError(null);
          setLoadingMediaTypes(false);
        })
        .catch((err) => {
          if (cancelled) return;
          setMediaTypesError(err);
          setLoadingMediaTypes(false);
        });
    }

    if (!genresCache) {
      if (!genresPromise) {
        genresPromise = fetchGenresOnce()
          .then((options) => {
            genresCache = options;
            genresErrorCache = null;
            return options;
          })
          .catch((err) => {
            genresErrorCache = err instanceof Error ? err : new Error("Failed to load genres");
            throw genresErrorCache;
          })
          .finally(() => {
            genresPromise = null;
          });
      }

      setLoadingGenres(true);
      genresPromise
        ?.then((options) => {
          if (cancelled) return;
          setAvailableGenres(options);
          setGenresError(null);
          setLoadingGenres(false);
        })
        .catch((err) => {
          if (cancelled) return;
          setGenresError(err);
          setLoadingGenres(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    availableMediaTypes,
    availableGenres,
    loadingMediaTypes,
    loadingGenres,
    mediaTypesError,
    genresError,
  };
}
