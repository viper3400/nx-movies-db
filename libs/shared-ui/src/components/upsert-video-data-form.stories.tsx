import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { UpsertVideoDataForm, UpsertVideoDataFormValues } from "./upsert-video-data-form";
import { EditableFormWrapper, EDITABLE_FORM_FRAME_OPTIONS } from "./editable-form-wrapper";
import { fn } from "storybook/test";

const meta: Meta<typeof UpsertVideoDataForm> = {
  component: UpsertVideoDataForm,
  title: "Forms/UpsertVideoDataForm",
  args: {
    inputVariant: "underlined",
    readOnly: false,
    readOnlyFields: {},
    values: {
      title: "The Matrix",
      subtitle: "Welcome to the real world",
      year: 1999,
      language: "en",
      country: "USA",
      rating: "R",
      runtime: 136,
      imdbID: "tt0133093",
      filename: "matrix.mkv",
      video_width: 1920,
      video_height: 1080,
      mediatype: 1,
    } as UpsertVideoDataFormValues,
    onChange: fn(),
  },
  argTypes: {
    inputVariant: { control: { type: "radio" }, options: ["flat", "bordered", "underlined", "faded"] },
    values: { control: { type: "object" } },
    readOnlyFields: { control: { type: "object" } },
  },
};
export default meta;

type Story = StoryObj<typeof UpsertVideoDataForm>;

export const Editable: Story = {
  render: (args) => {
    const [, updateArgs] = useArgs();
    return (
      <div className="p-6 max-w-5xl">
        <UpsertVideoDataForm
          {...args}
          onChange={(v) => {
            updateArgs({ values: v });
            args.onChange?.(v);
            console.log("UpsertVideoDataForm changed", v);
          }}
        />
      </div>
    );
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return (
      <div className="p-6 max-w-5xl">
        <UpsertVideoDataForm
          {...args}
          onChange={(v) => {
            updateArgs({ values: v });
            args.onChange?.(v);
          }}
        />
      </div>
    );
  },
};

export const PartiallyReadOnly: Story = {
  args: { readOnly: false, readOnlyFields: { id: true, imdbID: true, filename: true } },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return (
      <div className="p-6 max-w-5xl">
        <UpsertVideoDataForm
          {...args}
          onChange={(v) => {
            updateArgs({ values: v });
            args.onChange?.(v);
          }}
        />
      </div>
    );
  },
};

export const WithWrapper: Story = {
  name: "With Save/Discard Wrapper",
  parameters: { frame: EDITABLE_FORM_FRAME_OPTIONS[0] },
  render: renderWithWrapper,
};

export const WithWrapperFramedAll: Story = {
  name: "With Wrapper (frame=all)",
  parameters: { frame: EDITABLE_FORM_FRAME_OPTIONS[1] },
  render: renderWithWrapper,
};

export const WithWrapperNoFrame: Story = {
  name: "With Wrapper (frame=none)",
  parameters: { frame: EDITABLE_FORM_FRAME_OPTIONS[2] },
  render: renderWithWrapper,
};

function renderWithWrapper(args: any, { parameters }: any) {
  const [, updateArgs] = useArgs();
  const frame = (parameters as any)?.frame ?? EDITABLE_FORM_FRAME_OPTIONS[0];
  return (
    <div className="p-6 max-w-5xl">
      <EditableFormWrapper
        initialValues={args.values}
        frame={frame}
        onSave={async (v) => {
          updateArgs({ values: v });
          args.onChange?.(v);
        }}
      >
        {({ values, onChange, readOnly }) => (
          <UpsertVideoDataForm
            values={values}
            onChange={onChange}
            readOnly={readOnly}
            readOnlyFields={args.readOnlyFields}
            inputVariant={args.inputVariant}
          />
        )}
      </EditableFormWrapper>
    </div>
  );
}
