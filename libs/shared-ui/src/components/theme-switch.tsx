"use client";

import { FC } from "react";
import { useTheme } from "../lib/theme-provider";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";

import { SunFilledIcon, MoonFilledIcon } from "../icons/icons";
import { Switch } from "@heroui-v3/react";

export interface ThemeSwitchProps {
  className?: string;
  wrapperClassName?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  wrapperClassName,
}) => {
  const { theme, setTheme } = useTheme();
  const isSSR = useIsSSR();

  const isSelected = theme === "light" || isSSR;

  return (
    <Switch
      isSelected={isSelected}
      aria-label={`Switch to ${isSelected ? "dark" : "light"} mode`}
      onChange={() => setTheme(isSelected ? "dark" : "light")}
      className={clsx(
        "px-px transition-opacity hover:opacity-80 cursor-pointer",
        className,
      )}
    >
      <Switch.Content>
        <Switch.Control
          className={clsx(
            "w-auto h-auto bg-transparent rounded-lg flex items-center justify-center data-[selected=true]:bg-transparent !text-default-500 pt-px px-0 mx-0 border-none shadow-none",
            wrapperClassName,
          )}
        >
          <Switch.Thumb className="hidden" />
          {!isSelected || isSSR ? (
            <SunFilledIcon size={22} />
          ) : (
            <MoonFilledIcon size={22} />
          )}
        </Switch.Control>
      </Switch.Content>
    </Switch>
  );
};
