import type { Meta, StoryObj } from "@storybook/react-vite";
import { VersionInfoPanel } from "./version-info-panel";

const meta: Meta<typeof VersionInfoPanel> = {
  component: VersionInfoPanel,
  title: "VersionInfoPanel",
  args: {
    appVersion: "1.5.8",
    heading: "Version information",
    description: "You are currently viewing the production deployment.",
    details: [
      { label: "Commit", value: "3f2c1b7" },
      { label: "Released", value: "2026-03-20 14:23 UTC" },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof VersionInfoPanel>;

export const Default: Story = {};

export const Minimal: Story = {
  args: {
    description: "",
    details: [],
    appVersion: "2.0.0",
  },
};

export const WithEnvironmentDetails: Story = {
  args: {
    heading: "Movies DB build",
    description: "Internal QA rollout information.",
    details: [
      { label: "Environment", value: "Staging" },
      { label: "Git SHA", value: "8ac91d2" },
      { label: "Built", value: "2026-03-25 21:45 UTC" },
    ],
  },
};
