import type { Meta, StoryObj } from "@storybook/react-vite";
import { SurpriseButton } from "./surprise-button";
import { fn } from "storybook/test";

const meta: Meta<typeof SurpriseButton> = {
  component: SurpriseButton,
  title: "SurpriseButton",
};
export default meta;
type Story = StoryObj<typeof SurpriseButton>;

export const Default: Story = {
  args: {
    onPress: fn(),
  },
};
