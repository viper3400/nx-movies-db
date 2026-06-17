"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Spinner } from "@heroui-v3/react";
import isEqual from "react-fast-compare";

export const EDITABLE_FORM_FRAME_OPTIONS = ["content", "all", "none"] as const;
export type EditableFormFrame = typeof EDITABLE_FORM_FRAME_OPTIONS[number];

export interface EditableFormWrapperProps<T> {
  initialValues: T;
  onSave: (values: T) => T | void | Promise<T | void>;
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
    changedFields: string[];
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

  // Keep internal state in sync if external initialValues change
  useEffect(() => {
    setSavedValues(initialValues);
    setDraftValues(initialValues);
  }, [initialValues]);

  const dirty = useMemo(() => !isEqual(savedValues, draftValues), [savedValues, draftValues]);
  const changedFields = useMemo(() => {
    const savedRecord = savedValues as Record<string, unknown>;
    const draftRecord = draftValues as Record<string, unknown>;
    return Array.from(new Set([
      ...Object.keys(savedRecord ?? {}),
      ...Object.keys(draftRecord ?? {}),
    ])).filter((key) => !isEqual(savedRecord?.[key], draftRecord?.[key]));
  }, [savedValues, draftValues]);

  const handleSave = async () => {
    if (saving || readOnly || !dirty) return;
    try {
      setSaving(true);
      const savedResult = await onSave(draftValues);
      const nextSavedValues = savedResult ?? draftValues;
      setSavedValues(nextSavedValues);
      setDraftValues(nextSavedValues);
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
            variant="secondary"
            onPress={handleDiscard}
            isDisabled={!dirty || saving}
            data-testid="editable-form-discard"
          >
            {discardLabel}
          </Button>
          <Button
            variant="primary"
            onPress={handleSave}
            isDisabled={!dirty || readOnly}
            isPending={saving}
            data-testid="editable-form-save"
          >
            {({ isPending }) => (
              <>
                {isPending && <Spinner color="current" size="sm" />}
                {saveLabel}
              </>
            )}
          </Button>
        </div>
        <div className="h-2" />
      </>
    ) : null;

  const actionsBottom =
    actionsPosition === "bottom" || actionsPosition === "both" ? (
      <>
        <div className="h-2" />
        <div className="flex gap-2 justify-end w-full">
          <Button
            variant="secondary"
            onPress={handleDiscard}
            isDisabled={!dirty || saving}
            data-testid="editable-form-discard"
          >
            {discardLabel}
          </Button>
          <Button
            variant="primary"
            onPress={handleSave}
            isDisabled={!dirty || readOnly}
            isPending={saving}
            data-testid="editable-form-save"
          >
            {({ isPending }) => (
              <>
                {isPending && <Spinner color="current" size="sm" />}
                {saveLabel}
              </>
            )}
          </Button>
        </div>
      </>
    ) : null;

  const formContent = children({
    values: draftValues,
    onChange: setDraftValues,
    readOnly,
    dirty,
    changedFields,
    saving,
  });

  if (frame === "all") {
    return (
      <Card className={className ? `rounded-lg shadow-sm ${className}` : "rounded-lg shadow-sm"} data-testid="editable-form-card">
        <Card.Content>
          {actionsTop}
          {formContent}
          {actionsBottom}
        </Card.Content>
      </Card>
    );
  }

  return (
    <div className={className} data-testid="editable-form-wrapper">
      {actionsTop}
      {frame === "content" ? (
        <Card className="rounded-lg shadow-sm" data-testid="editable-form-content-card">
          <Card.Content>{formContent}</Card.Content>
        </Card>
      ) : (
        formContent
      )}
      {actionsBottom}
    </div>
  );
}

export default EditableFormWrapper;
