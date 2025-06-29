import type { Meta, StoryObj } from "@storybook/react-vite";
import { UserFlagChip } from "./user-flag-chip";

const meta: Meta<typeof UserFlagChip> = {
  component: UserFlagChip,
  title: "UserFlagChip",
};
export default meta;
type Story = StoryObj<typeof UserFlagChip>;

export const Watchagain: Story = {
  args: {
    type: "Watchagain",
  },
};

export const Favorite: Story = {
  args: {
    type: "Favorite",
  },
};
