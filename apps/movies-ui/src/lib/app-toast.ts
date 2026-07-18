import { Toast } from "@heroui/react";

type ToastSeverity = "success" | "danger" | "warning";

export const appToastQueue = new Toast.Queue({
  maxVisibleToasts: Number.MAX_SAFE_INTEGER,
  wrapUpdate: (update) => update(),
});

export function showAppToast({
  title,
  description,
  severity,
  timeout,
}: {
  title: string;
  description?: string;
  severity: ToastSeverity;
  timeout?: number;
}) {
  const resolvedTimeout = timeout ?? (severity === "success" ? 5000 : 9000);

  return appToastQueue.add(
    {
      title,
      description,
      variant: severity,
    },
    { timeout: resolvedTimeout },
  );
}
