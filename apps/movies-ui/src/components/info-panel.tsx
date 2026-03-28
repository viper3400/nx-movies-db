import { VersionInfoPanel } from "@nx-movies-db/shared-ui/server";

import { getSystemInfo } from "../app/services/actions/getSystemInfo";

export const InfoPanel = async () => {
  const systemInfo = await getSystemInfo();

  return (
    <div className="flex w-full justify-center p-4">
      <VersionInfoPanel
        heading="Deployment information"
        description="Current movies workspace version."
        appVersion={systemInfo?.appVersion ?? "unknown"}
      />
    </div>
  );
};
