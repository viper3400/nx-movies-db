import type { Meta, StoryObj } from "@storybook/react";
import { UserFlagButton } from "./user-flag-button";

const meta: Meta<typeof UserFlagButton> = {
  component: UserFlagButton,
  title: "UserFlagButton",
};
export default meta;
type Story = StoryObj<typeof UserFlagButton>;

export const Default: Story = {
  args: {
    userFlagChipProps: {
      type: "Favorite",
      active: true
    }
  },
};
