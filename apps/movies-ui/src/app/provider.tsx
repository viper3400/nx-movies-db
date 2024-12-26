"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";
import { SessionProvider } from "next-auth/react";

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
      <NextUIProvider navigate={router.push}>
        {isMounted ? (
          <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
        ) : (
          <div className="h-screen w-screen bg-black"></div>
        )}
      </NextUIProvider>
    </SessionProvider>
  );
}
