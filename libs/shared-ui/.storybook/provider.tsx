"use client";

import * as React from "react";
import { HeroUIProvider } from "@heroui/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../src/i18n/i18n";
import { ThemeProvider as SharedThemeProvider, ThemeProviderOptions } from "../src/lib/theme-provider";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderOptions;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <HeroUIProvider>
        <SharedThemeProvider {...themeProps}>{children}</SharedThemeProvider>
      </HeroUIProvider>
    </I18nextProvider>
  );
}
