import type { Meta, StoryObj } from "@storybook/react";
import { within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { SeenChips } from "./seen-chips";

const meta: Meta<typeof SeenChips> = {
  component: SeenChips,
  title: "SeenChips",
};
export default meta;
type Story = StoryObj<typeof SeenChips>;

export const Primary = {
  args: {
    seenDates: ["2023-01-01", "2023-02-15", "2023-03-10"],
  },
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to Shared!/gi)).toBeTruthy();
  },
};
