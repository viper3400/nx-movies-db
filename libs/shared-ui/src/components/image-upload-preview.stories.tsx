import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import { ImageUploadPreview, type ImageSource } from "./image-upload-preview";

const meta: Meta<typeof ImageUploadPreview> = {
  component: ImageUploadPreview,
  title: "Media/ImageUploadPreview",
  args: {
    label: "Poster",
    placeholderUrl: "https://placehold.co/80x120",
    initialUrl: "https://placehold.co/80x120",
    onChange: fn(),
  },
  argTypes: {
    onChange: { action: "change" },
  },
};
export default meta;

type Story = StoryObj<typeof ImageUploadPreview>;

export const Default: Story = {
  render: (args) => {
    const [, updateArgs] = useArgs();
    const handleChange = (src: ImageSource | null) => {
      args.onChange?.(src);
      // reflect the current URL into controls if applicable
      if (src?.type === "url") updateArgs({ initialUrl: src.url });
      if (!src) updateArgs({ initialUrl: "" });
    };
    return (
      <div className="p-6 max-w-4xl">
        <ImageUploadPreview {...args} onChange={handleChange} />
      </div>
    );
  },
};

export const Empty: Story = {
  args: { initialUrl: "" },
};

