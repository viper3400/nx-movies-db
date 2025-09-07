"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Spacer, Card, CardBody } from "@heroui/react";

export const EDITABLE_FORM_FRAME_OPTIONS = ["content", "all", "none"] as const;
export type EditableFormFrame = typeof EDITABLE_FORM_FRAME_OPTIONS[number];

export interface EditableFormWrapperProps<T> {
  initialValues: T;
  onSave: (values: T) => void | Promise<void>;
  onDiscard?: (values: T) => void;
  readOnly?: boolean;
  className?: string;
  saveLabel?: string;
  discardLabel?: string;
  actionsPosition?: "top" | "bottom" | "both";
  // Visual framing of the form: around just the content, the whole wrapper, or none
  frame?: EditableFormFrame;
  children: (args: {
    values: T;
    onChange: (values: T) => void;
    readOnly: boolean;
    dirty: boolean;
    saving: boolean;
  }) => React.ReactNode;
}

function isEqualDeep<T>(a: T, b: T): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}

export function EditableFormWrapper<T>(props: EditableFormWrapperProps<T>) {
  const {
    initialValues,
    onSave,
    onDiscard,
    readOnly = false,
    className,
    saveLabel = "Save",
    discardLabel = "Discard",
    actionsPosition = "bottom",
    frame = "content",
    children,
  } = props;

  const [savedValues, setSavedValues] = useState<T>(initialValues);
  const [draftValues, setDraftValues] = useState<T>(initialValues);
  const [saving, setSaving] = useState(false);

  // Keep internal state in sync if external initialValues change
  useEffect(() => {
    setSavedValues(initialValues);
    setDraftValues(initialValues);
  }, [initialValues]);

  const dirty = useMemo(() => !isEqualDeep(savedValues, draftValues), [savedValues, draftValues]);

  const handleSave = async () => {
    if (saving || readOnly || !dirty) return;
    try {
      setSaving(true);
      await onSave(draftValues);
      setSavedValues(draftValues);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (saving || !dirty) return;
    setDraftValues(savedValues);
    onDiscard?.(savedValues);
  };

  const Actions = (
    <div className="flex gap-2 justify-end w-full">
      <Button
        color="default"
        variant="flat"
        onPress={handleDiscard}
        isDisabled={!dirty || saving}
      >
        {discardLabel}
      </Button>
      <Button
        color="primary"
        onPress={handleSave}
        isDisabled={!dirty || readOnly}
        isLoading={saving}
      >
        {saveLabel}
      </Button>
    </div>
  );

  const actionsTop =
    actionsPosition === "top" || actionsPosition === "both" ? (
      <>
        {Actions}
        <Spacer y={2} />
      </>
    ) : null;

  const actionsBottom =
    actionsPosition === "bottom" || actionsPosition === "both" ? (
      <>
        <Spacer y={2} />
        {Actions}
      </>
    ) : null;

  const formContent = children({ values: draftValues, onChange: setDraftValues, readOnly, dirty, saving });

  if (frame === "all") {
    return (
      <Card shadow="sm" radius="lg" className={className}>
        <CardBody>
          {actionsTop}
          {formContent}
          {actionsBottom}
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={className}>
      {actionsTop}
      {frame === "content" ? (
        <Card shadow="sm" radius="lg">
          <CardBody>{formContent}</CardBody>
        </Card>
      ) : (
        formContent
      )}
      {actionsBottom}
    </div>
  );
}

export default EditableFormWrapper;
