import type { Meta, StoryObj } from "@storybook/react";
import { DateRangeSearchComponent } from "./date-range-search";
import { fn } from "@storybook/test";


const meta: Meta<typeof DateRangeSearchComponent> = {
  component: DateRangeSearchComponent,
  title: "Date Range Search Component",
  parameters: {
    docs: {
      description: {
        component: "This component allows users to search for a range of dates. It is designed to be used in forms or filters where date range selection is required.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof DateRangeSearchComponent>;

export const Default: Story = {
  args: {
    onApply: (fn()),
  },
};
