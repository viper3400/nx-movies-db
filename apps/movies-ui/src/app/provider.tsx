"use client";

import * as React from "react";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { I18nextProvider } from "react-i18next";
import i18n from "@nx-movies-db/shared-ui";
import { parseUserString } from "../lib/allowed-user-parser";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

const testModeEnabled = process.env.NEXT_PUBLIC_TEST_MODE === "true";
const allowedUsersEnv = process.env.NEXT_PUBLIC_ALLOWED_USERS ?? "";
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

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <SessionProvider basePath={process.env.NEXT_PUBLIC_NEXTAUTH_URL} session={stubSession ?? undefined}>
      <I18nextProvider i18n={i18n}>
        <HeroUIProvider navigate={router.push}>
          <ToastProvider placement="top-center" />
          {isMounted ? (
            <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
          ) : (
            <div className="h-screen w-screen bg-black"></div>
          )}
        </HeroUIProvider>
      </I18nextProvider>
    </SessionProvider>
  );
}
