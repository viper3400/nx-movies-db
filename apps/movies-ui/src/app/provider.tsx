"use client";

import * as React from "react";
import { Toast } from "@heroui/react";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { I18nextProvider } from "react-i18next";
import i18n, { ThemeProvider as SharedThemeProvider, ThemeProviderOptions } from "@nx-movies-db/shared-ui";
import { parseUserString } from "../lib/allowed-user-parser";
import { appToastQueue } from "../lib/app-toast";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderOptions;
  nextAuthUrl?: string | null;
}

const testModeEnabled = process.env.NEXT_PUBLIC_TEST_MODE === "true";
const allowedUsersEnv = process.env.NEXT_PUBLIC_TEST_USERS ?? "";
const testUsers = allowedUsersEnv
  ? parseUserString(allowedUsersEnv).filter((user) => Boolean(user.email) && Boolean(user.name))
  : [];
const fallbackTestUser = testUsers[0] ?? {
  email: "tester@example.com",
  name: "Tester",
  id: 1,
};
let stubSession: Session | null = null;

if (testModeEnabled) {
  stubSession = {
    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    user: {
      email: fallbackTestUser.email,
      name: fallbackTestUser.name,
      image: "",
    },
  };
}

export function Providers({ children, themeProps, nextAuthUrl }: ProvidersProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <SessionProvider basePath={nextAuthUrl ?? undefined} session={stubSession ?? undefined}>
      <I18nextProvider i18n={i18n}>
        <Toast.Provider
          className="z-[70]"
          placement="top"
          gap={12}
          maxVisibleToasts={5}
          queue={appToastQueue}
          scaleFactor={0}
          width="min(32rem, calc(100vw - 2rem))"
        />
        {isMounted ? (
          <SharedThemeProvider {...themeProps}>{children}</SharedThemeProvider>
        ) : (
          <div className="h-screen w-screen bg-black"></div>
        )}
      </I18nextProvider>
    </SessionProvider>
  );
}
