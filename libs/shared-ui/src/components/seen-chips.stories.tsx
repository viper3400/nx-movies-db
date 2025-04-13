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

export const Seen = {
  args: {
    seenDates: ["2023-01-01", "2023-02-15", "2023-03-10", new Date()],
  },
};

export const NotSeen: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/noch nicht gesehen/gi)).toBeTruthy();
  },
};
