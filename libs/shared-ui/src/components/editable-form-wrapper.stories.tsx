import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { useArgs } from "storybook/preview-api";
import { Input, Textarea } from "@heroui/react";
import { EditableFormWrapper, EDITABLE_FORM_FRAME_OPTIONS } from "./editable-form-wrapper";
import { fn } from "storybook/test";

interface ProfileValues {
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
}

const defaultValues: ProfileValues = {
  firstName: "Neo",
  lastName: "Anderson",
  email: "neo@zion.example",
  bio: "I know kung fu.",
};

const Example: React.FC<{
  initialValues: ProfileValues;
  readOnly?: boolean;
  actionsPosition?: "top" | "bottom" | "both";
  frame?: "content" | "all" | "none";
  saveLabel?: string;
  discardLabel?: string;
  onSave: (values: ProfileValues) => void | Promise<void>;
  onDiscard?: (values: ProfileValues) => void;
}> = (args) => {
  return (
    <div className="p-6 max-w-2xl">
      <EditableFormWrapper<ProfileValues>
        initialValues={args.initialValues}
        readOnly={args.readOnly}
        actionsPosition={args.actionsPosition}
        frame={args.frame}
        saveLabel={args.saveLabel}
        discardLabel={args.discardLabel}
        onSave={args.onSave}
        onDiscard={args.onDiscard}
      >
        {({ values, onChange, readOnly }) => (
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="First name"
              value={values.firstName}
              onChange={(e) => onChange({ ...values, firstName: e.target.value })}
              isReadOnly={readOnly}
              variant="underlined"
              size="lg"
            />
            <Input
              label="Last name"
              value={values.lastName}
              onChange={(e) => onChange({ ...values, lastName: e.target.value })}
              isReadOnly={readOnly}
              variant="underlined"
              size="lg"
            />
            <Input
              type="email"
              label="Email"
              value={values.email}
              onChange={(e) => onChange({ ...values, email: e.target.value })}
              isReadOnly={readOnly}
              variant="underlined"
              size="lg"
            />
            <Textarea
              label="Bio"
              value={values.bio ?? ""}
              onChange={(e) => onChange({ ...values, bio: e.target.value })}
              isReadOnly={readOnly}
              variant="underlined"
              minRows={3}
            />
          </div>
        )}
      </EditableFormWrapper>
    </div>
  );
};

const meta: Meta<typeof Example> = {
  component: Example,
  title: "Forms/EditableFormWrapper",
  args: {
    initialValues: defaultValues,
    readOnly: false,
    actionsPosition: "bottom",
    frame: "content",
    saveLabel: "Save",
    discardLabel: "Discard",
    onSave: fn(),
    onDiscard: fn(),
  },
  argTypes: {
    actionsPosition: { control: { type: "radio" }, options: ["top", "bottom", "both"] },
    frame: { control: { type: "radio" }, options: EDITABLE_FORM_FRAME_OPTIONS },
    initialValues: { control: { type: "object" } },
    saveLabel: { control: { type: "text" } },
    discardLabel: { control: { type: "text" } },
  },
};

export default meta;

type Story = StoryObj<typeof Example>;

export const Default: Story = {
  render: (args) => {
    const [, updateArgs] = useArgs();
    return (
      <Example
        {...args}
        onSave={async (v) => {
          await new Promise((r) => setTimeout(r, 400));
          updateArgs({ initialValues: v });
          args.onSave?.(v);
        }}
        onDiscard={(v) => args.onDiscard?.(v)}
      />
    );
  },
};

export const ActionsTop: Story = {
  args: { actionsPosition: "top" },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return (
      <Example
        {...args}
        onSave={async (v) => {
          await new Promise((r) => setTimeout(r, 400));
          updateArgs({ initialValues: v });
          args.onSave?.(v);
        }}
      />
    );
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return (
      <Example
        {...args}
        onSave={async (v) => {
          await new Promise((r) => setTimeout(r, 400));
          updateArgs({ initialValues: v });
          args.onSave?.(v);
        }}
      />
    );
  },
};
