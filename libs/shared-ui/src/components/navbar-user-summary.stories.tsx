import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { NavbarUserSummary } from "./navbar-user-summary";

const meta: Meta<typeof NavbarUserSummary> = {
  component: NavbarUserSummary,
  title: "Navbar/NavbarUserSummary",
  args: {
    userName: "Hans Dampf",
    userEmail: "hans@gmail.com",
    userImage: "https://i.pravatar.cc/150?u=a04258a2462d826712d",
  },
};

export default meta;
type Story = StoryObj<typeof NavbarUserSummary>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summary = await canvas.findByTestId("navbar-user-summary");
    await expect(within(summary).findByText("Hans Dampf")).resolves.toBeVisible();
    await expect(within(summary).findByText("hans@gmail.com")).resolves.toBeVisible();
  },
};

export const EmailOnly: Story = {
  args: {
    userName: undefined,
    userImage: undefined,
    userEmail: "user@example.com",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summary = await canvas.findByTestId("navbar-user-summary");
    await expect(within(summary).findByText("user@example.com")).resolves.toBeVisible();
  },
};
