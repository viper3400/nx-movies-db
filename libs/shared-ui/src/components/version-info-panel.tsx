"use client";

import { ReactNode, useMemo } from "react";
import { Chip } from "@heroui/react";
import clsx from "clsx";

export interface VersionInfoDetail {
  label: string;
  value: ReactNode;
}

export interface VersionInfoPanelProps {
  /**
   * Semantic version (or tag) that should be surfaced to end users.
   */
  appVersion: string;
  /**
   * Additional metadata (for example git SHA or environment name) shown in a definition list.
   */
  details?: VersionInfoDetail[];
  /**
   * Modal title, defaults to "Version information".
   */
  heading?: string;
  /**
   * Optional sentence rendered above the highlighted version badge.
   */
  description?: string;
  /**
   * Optional CSS class applied to the wrapper.
   */
  className?: string;
}

export const VersionInfoPanel = ({
  appVersion,
  details = [],
  heading = "Version information",
  description = "You are running the following build:",
  className,
}: VersionInfoPanelProps) => {
  const normalizedDetails = useMemo(
    () =>
      details.filter(
        (detail) =>
          Boolean(detail?.label?.toString().trim()) && detail.value !== null && detail.value !== undefined,
      ),
    [details],
  );

  return (
    <section
      aria-label={heading}
      className={clsx(
        "w-full rounded-large border border-divider bg-content1 p-6 shadow-small",
        "flex flex-col gap-4",
        className,
      )}
      data-testid="version-info-panel"
    >
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-default-400">System</p>
        <h2 className="text-xl font-semibold text-foreground">{heading}</h2>
      </header>
      {description ? <p className="text-sm text-default-500">{description}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-default-500">Version</span>
        <Chip color="secondary" variant="flat" className="font-mono text-base">
          {appVersion}
        </Chip>
      </div>

      {normalizedDetails.length > 0 && (
        <dl className="space-y-3 text-sm">
          {normalizedDetails.map((detail, index) => (
            <div className="flex flex-col gap-1" key={`${detail.label}-${index}`}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-default-400">{detail.label}</dt>
              <dd className="font-mono text-default-700 break-words">{detail.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
};

export default VersionInfoPanel;
