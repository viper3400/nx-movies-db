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


export const Loading = {
  args: {
    loading: true,
    notSeenLabel: "not seen"
  },
};
export const SeenToday = {
  args: {
    seenDates: ["2023-01-01", "2023-02-15", "2023-03-10", new Date()],
    seenTodayLabel: "seen today",
    loading: false
  },
};

export const NotSeenDefault: Story = {
  args: {
    notSeenLabel: "not seen"
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/not seen/gi)).toBeTruthy();
  },
};

export const NotSeenLocalized: Story = {
  args: {
    notSeenLabel: "noch nicht gesehen",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/noch nicht gesehen/gi)).toBeTruthy();
  },
};
