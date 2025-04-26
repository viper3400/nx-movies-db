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


export const Loading: Story = {
  args: {
    loading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryAllByTestId("not_seen_chip")).toHaveLength(0);
    expect(canvas.queryAllByTestId("loading_chip")).toHaveLength(1);
    expect(canvas.queryAllByTestId("times_seen_chip")).toHaveLength(0);
    expect(canvas.queryAllByTestId("seen_date_chip")).toHaveLength(0);
    expect(canvas.queryAllByTestId("seen_date_duration_chip")).toHaveLength(0);
  },
};
export const SeenToday: Story = {
  args: {
    //seenDates: [new Date("2023,0,1"), new Date("2023,1,15"), new Date("2023,2,10"), new Date()],
    seenDates: [
      new Date().toISOString(),
      "2023-03-10T00:00:00Z",
      "2023-02-15T00:00:00Z",
      "2023-01-01T00:00:00Z"
    ],
    loading: false
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryAllByTestId("not_seen_chip")).toHaveLength(0);
    expect(canvas.queryAllByTestId("loading_chip")).toHaveLength(0);
    expect(canvas.queryAllByTestId("times_seen_chip")).toHaveLength(1);
    expect(canvas.queryAllByTestId("seen_date_chip")).toHaveLength(4);
    expect(canvas.queryAllByTestId("seen_date_duration_chip")).toHaveLength(1);
  },
};

export const NotSeenDefault: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryAllByTestId("not_seen_chip")).toHaveLength(1);
    expect(canvas.queryAllByTestId("loading_chip")).toHaveLength(0);
    expect(canvas.queryAllByTestId("times_seen_chip")).toHaveLength(0);
    expect(canvas.queryAllByTestId("seen_date_chip")).toHaveLength(0);
    expect(canvas.queryAllByTestId("seen_date_duration_chip")).toHaveLength(0);
  },
};
