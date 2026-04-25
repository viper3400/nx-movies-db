import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState, type ComponentProps } from "react";
import { UpsertVideoDataForm, UpsertVideoDataFormValues } from "./upsert-video-data-form";
import { EditableFormWrapper, EDITABLE_FORM_FRAME_OPTIONS } from "./editable-form-wrapper";
import { fn, within, userEvent, expect } from "storybook/test";

const mediaTypeOptions = [
  { label: "Movie", value: "1" },
  { label: "TV", value: "2" },
];

const ownerOptions = [
  { label: "Default owner", value: "1" },
];

const genreOptions = [
  { label: "Action", value: "1" },
  { label: "Sci-Fi", value: "2" },
];

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
    mediaTypeOptions,
    ownerOptions,
    genreOptions,
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
  render: (args) => <EditableFormStory {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const titleInput = canvas.getByTestId("video-field-title");

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Buffered Title");

    const genresSelect = canvas.getByTestId("video-field-genres");
    await userEvent.click(genresSelect);
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
  render: (args) => <EditableFormStory {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const titleInput = canvas.getByTestId("video-field-title");
    await expect(titleInput).toBeDisabled();
  },
};

export const PartiallyReadOnly: Story = {
  args: { readOnly: false, readOnlyFields: { id: true, imdbID: true, filename: true } },
  render: (args) => <EditableFormStory {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const imdbInput = canvas.getByTestId("video-field-imdbID");
    const titleInput = canvas.getByTestId("video-field-title");

    await expect(imdbInput).toBeDisabled();
    await expect(titleInput).not.toBeDisabled();
  },
};

export const WithWrapper: Story = {
  name: "With Save/Discard Wrapper",
  parameters: { frame: EDITABLE_FORM_FRAME_OPTIONS[0] },
  render: renderWithWrapper,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const titleInput = canvas.getByTestId("video-field-title");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Wrapped Title");
  },
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
  const frame = (parameters as any)?.frame ?? EDITABLE_FORM_FRAME_OPTIONS[0];
  return <WrapperFormStory args={args} frame={frame} />;
}

function EditableFormStory(args: ComponentProps<typeof UpsertVideoDataForm>) {
  const [values, setValues] = useState(args.values);

  useEffect(() => {
    setValues(args.values);
  }, [args.values]);

  return (
    <div className="p-6 max-w-5xl">
      <UpsertVideoDataForm
        {...args}
        values={values}
        onChange={(v) => {
          setValues(v);
          args.onChange?.(v);
        }}
      />
    </div>
  );
}

function WrapperFormStory({
  args,
  frame,
}: {
  args: ComponentProps<typeof UpsertVideoDataForm>;
  frame: (typeof EDITABLE_FORM_FRAME_OPTIONS)[number];
}) {
  return (
    <div className="p-6 max-w-5xl">
      <EditableFormWrapper
        initialValues={args.values}
        frame={frame}
        onSave={async (v) => {
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
            mediaTypeOptions={args.mediaTypeOptions}
            ownerOptions={args.ownerOptions}
            genreOptions={args.genreOptions}
          />
        )}
      </EditableFormWrapper>
    </div>
  );
}
