import { useEffect, useState } from "react";
import { getOwners } from "../app/services/actions";

export function useAvailableOwners() {
  const [availableOwners, setAvailableOwners] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const fetchOwners = async () => {
      const data = await getOwners();
      setAvailableOwners(
        data.owners.map((owner) => ({
          label: owner.name,
          value: String(owner.id),
        }))
      );
    };

    fetchOwners();
  }, []);

  return { availableOwners };
}
