import type { Meta, StoryObj } from "@storybook/react";
import { NavbarComponent } from "./navbar";


const meta: Meta<typeof NavbarComponent> = {
  component: NavbarComponent,
  title: "Navbar Component",
};
export default meta;
type Story = StoryObj<typeof NavbarComponent>;

export const Default: Story = {
  args: {
    isValidSession: true,
    userEmail: "hans@gmail.com",
    userName: "Hans Dampf",
    userImage: "https://i.pravatar.cc/150?u=a04258a2462d826712d"
  },
};
