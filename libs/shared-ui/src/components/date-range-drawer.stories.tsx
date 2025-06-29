import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateRangeDrawerComponent } from "./date-range-drawer";
import { fn } from "storybook/test";

const meta: Meta<typeof DateRangeDrawerComponent> = {
  component: DateRangeDrawerComponent,
  title: "Date Range Drawer Component",
};
export default meta;

type Story = StoryObj<typeof DateRangeDrawerComponent>;

export const Default: Story = {
  args: {
    onApply: fn()
  },
};
