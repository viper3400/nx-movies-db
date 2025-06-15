import { useEffect, useState } from "react";
import { getAppBasePath } from "../app/services/actions/getAppBasePath";

export function useAppBasePath() {
  const [appBasePath, setAppBasePath] = useState<string>();
  const [imageBaseUrl, setImageBaseUrl] = useState<string>();

  useEffect(() => {
    const fetch = async () => {
      const basePath = await getAppBasePath();
      setAppBasePath(basePath);
      setImageBaseUrl(basePath + "/api/cover-image");
    };
    fetch();
  }, []);

  return { appBasePath, imageBaseUrl };
}
