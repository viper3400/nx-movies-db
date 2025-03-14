"use client";

import * as React from "react";
import { HeroUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";
import { SessionProvider } from "next-auth/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n/i18n";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <SessionProvider basePath={process.env.NEXT_PUBLIC_NEXTAUTH_URL}>
      <I18nextProvider i18n={i18n}>
        <HeroUIProvider navigate={router.push}>
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
