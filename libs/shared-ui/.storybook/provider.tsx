"use client";

import * as React from "react";
import { HeroUIProvider } from "@heroui/react";
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";
import { I18nextProvider } from "react-i18next";
import i18n from "../src/i18n/i18n";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <HeroUIProvider>
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </HeroUIProvider>
    </I18nextProvider>
  );
}
