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

  const savedSnapshot = useMemo(() => JSON.stringify(savedValues), [savedValues]);
  const draftSnapshot = useMemo(() => JSON.stringify(draftValues), [draftValues]);

  // Keep internal state in sync if external initialValues change
  useEffect(() => {
    setSavedValues(initialValues);
    setDraftValues(initialValues);
  }, [initialValues]);

  const dirty = savedSnapshot !== draftSnapshot;

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

  const actionsTop =
    actionsPosition === "top" || actionsPosition === "both" ? (
      <>
        <div className="flex gap-2 justify-end w-full">
          <Button
            color="default"
            variant="flat"
            onPress={handleDiscard}
            isDisabled={!dirty || saving}
            data-testid="editable-form-discard"
          >
            {discardLabel}
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isDisabled={!dirty || readOnly}
            isLoading={saving}
            data-testid="editable-form-save"
          >
            {saveLabel}
          </Button>
        </div>
        <Spacer y={2} />
      </>
    ) : null;

  const actionsBottom =
    actionsPosition === "bottom" || actionsPosition === "both" ? (
      <>
        <Spacer y={2} />
        <div className="flex gap-2 justify-end w-full">
          <Button
            color="default"
            variant="flat"
            onPress={handleDiscard}
            isDisabled={!dirty || saving}
            data-testid="editable-form-discard"
          >
            {discardLabel}
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isDisabled={!dirty || readOnly}
            isLoading={saving}
            data-testid="editable-form-save"
          >
            {saveLabel}
          </Button>
        </div>
      </>
    ) : null;

  const formContent = children({ values: draftValues, onChange: setDraftValues, readOnly, dirty, saving });

  if (frame === "all") {
    return (
      <Card shadow="sm" radius="lg" className={className} data-testid="editable-form-card">
        <CardBody>
          {actionsTop}
          {formContent}
          {actionsBottom}
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={className} data-testid="editable-form-wrapper">
      {actionsTop}
      {frame === "content" ? (
        <Card shadow="sm" radius="lg" data-testid="editable-form-content-card">
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
