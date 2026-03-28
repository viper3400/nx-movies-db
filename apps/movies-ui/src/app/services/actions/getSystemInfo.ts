"use server";

import { gql, type TypedDocumentNode } from "@apollo/client";
import { getClient } from "../../../lib/apollocient";

type SystemInfoResult = {
  systemInfo?: {
    appVersion: string;
  } | null;
};

const systemInfoQuery: TypedDocumentNode<SystemInfoResult> = gql`
  query SystemInfo {
    systemInfo {
      appVersion
    }
  }
`;

export async function getSystemInfo() {
  const { data } = await getClient().query<SystemInfoResult>({
    query: systemInfoQuery,
    fetchPolicy: "no-cache",
  });

  return data?.systemInfo ?? null;
}
