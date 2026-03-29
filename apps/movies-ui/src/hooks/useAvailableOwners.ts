import { useEffect, useState } from "react";
import { getOwners } from "../app/services/actions";

type Option = { label: string; value: string };

let ownersCache: Option[] | null = null;
let ownersPromise: Promise<Option[]> | null = null;
let ownersErrorCache: Error | null = null;

const fetchOwnersOnce = async (): Promise<Option[]> => {
  const response = await getOwners();
  return response.owners.map((owner) => ({
    label: owner.name,
    value: String(owner.id),
  }));
};

export function useAvailableOwners() {
  const [availableOwners, setAvailableOwners] = useState<Option[]>(ownersCache ?? []);
  const [loadingOwners, setLoadingOwners] = useState<boolean>(!ownersCache);
  const [ownersError, setOwnersError] = useState<Error | null>(ownersErrorCache);

  useEffect(() => {
    let cancelled = false;

    if (!ownersCache) {
      if (!ownersPromise) {
        ownersPromise = fetchOwnersOnce()
          .then((options) => {
            ownersCache = options;
            ownersErrorCache = null;
            return options;
          })
          .catch((err) => {
            ownersErrorCache = err instanceof Error ? err : new Error("Failed to load owners");
            throw ownersErrorCache;
          })
          .finally(() => {
            ownersPromise = null;
          });
      }

      setLoadingOwners(true);
      ownersPromise
        ?.then((options) => {
          if (cancelled) return;
          setAvailableOwners(options);
          setOwnersError(null);
          setLoadingOwners(false);
        })
        .catch((err) => {
          if (cancelled) return;
          setOwnersError(err);
          setLoadingOwners(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return { availableOwners, loadingOwners, ownersError };
}
