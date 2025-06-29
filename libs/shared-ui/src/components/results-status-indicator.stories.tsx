import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResultsStatusIndicator } from "./results-status-indicator";

const meta: Meta<typeof ResultsStatusIndicator> = {
  component: ResultsStatusIndicator,
  title: "ResultsStatusIndicator",
  parameters: {
    docs: {
      description: {
        component: "The ResultsStatusIndicator component is used to indicate loading or display messages" +
          "when reaching the end of a page. It supports states for loading, no results, and no more" +
          "results. No result & and no more result cannot be true together and will raise an error",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ResultsStatusIndicator>;

export const Loading: Story = {
  args: {
    isLoading: true
  },
};

export const NoResult: Story = {
  args: {
    isLoading: false,
    hasNoResults: true
  },
};

export const NoMoreResult: Story = {
  args: {
    isLoading: false,
    hasNoMoreResults: true
  },
};

