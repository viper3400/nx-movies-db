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
      owner_id: 1,
      genreIds: [1],
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
type UpsertVideoDataFormArgs = ComponentProps<typeof UpsertVideoDataForm>;
type UpsertVideoDataFormRender = NonNullable<Story["render"]>;

export const Editable: Story = {
  render: (args) => <EditableFormStory {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const titleInput = canvas.getByTestId("video-field-title");
    const mediaTypeSelect = canvas.getByTestId("video-field-mediatype");
    const genresSelect = canvas.getByTestId("video-field-genres");

    await expect(titleInput).toHaveAccessibleName("Title");
    await expect(titleInput).toHaveValue("The Matrix");
    await expect(mediaTypeSelect).toHaveTextContent("Movie");
    await expect(genresSelect).toHaveTextContent("Action");

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Buffered Title");

    await expect(titleInput).toHaveValue("Buffered Title");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
  render: (args) => <EditableFormStory {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const titleInput = canvas.getByTestId("video-field-title");
    await expect(titleInput).toHaveAccessibleName("Title");
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

    await expect(imdbInput).toHaveAccessibleName("IMDB ID");
    await expect(titleInput).toHaveAccessibleName("Title");
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

    const saveButton = canvas.getByTestId("editable-form-save");
    const discardButton = canvas.getByTestId("editable-form-discard");
    const titleInput = canvas.getByTestId("video-field-title");

    await expect(titleInput).toHaveAccessibleName("Title");
    await expect(saveButton).toBeDisabled();
    await expect(discardButton).toBeDisabled();

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Wrapped Title");

    await expect(titleInput).toHaveValue("Wrapped Title");
    await expect(saveButton).toBeEnabled();
    await expect(discardButton).toBeEnabled();

    await userEvent.click(discardButton);

    await expect(titleInput).toHaveValue("The Matrix");
    await expect(saveButton).toBeDisabled();
    await expect(discardButton).toBeDisabled();
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

function renderWithWrapper(
  ...[args, { parameters }]: Parameters<UpsertVideoDataFormRender>
): ReturnType<UpsertVideoDataFormRender> {
  const frame = parameters.frame ?? EDITABLE_FORM_FRAME_OPTIONS[0];
  return <WrapperFormStory args={args} frame={frame} />;
}

function EditableFormStory(args: UpsertVideoDataFormArgs) {
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
  args: UpsertVideoDataFormArgs;
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
