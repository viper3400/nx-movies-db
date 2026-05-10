import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { NavbarComponent } from "./navbar";

const movieMenuLinks = [
  { href: "/", label: "Filmsuche" },
  { href: "/seen", label: "Gesehene Filme" },
  { href: "/edit/new", label: "Film hinzufügen" },
  { href: "/info", label: "Info" },
];

const meta: Meta<typeof NavbarComponent> = {
  component: NavbarComponent,
  title: "Navbar Component",
};
export default meta;
type Story = StoryObj<typeof NavbarComponent>;

export const Default: Story = {
  args: {
    userEmail: "hans@gmail.com",
    userName: "Hans Dampf",
    userImage: "https://i.pravatar.cc/150?u=a04258a2462d826712d",
    menuLinks: movieMenuLinks,
    handleSignOut: fn(),
    handleGoogleLogout: fn(),
    handleGithubLogout: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Open navigation menu" }));

    await expect(page.findByText("Hans Dampf")).resolves.toBeVisible();
    await expect(page.findByRole("button", { name: "Filmsuche" })).resolves.toHaveAttribute("href", "/");
    await expect(page.findByRole("button", { name: "Gesehene Filme" })).resolves.toHaveAttribute("href", "/seen");
    await expect(page.findByRole("button", { name: "Film hinzufügen" })).resolves.toHaveAttribute("href", "/edit/new");
    await expect(page.findByRole("button", { name: "Info" })).resolves.toHaveAttribute("href", "/info");
    expect(page.queryByText("Github Logout")).not.toBeInTheDocument();

    await userEvent.click(page.getByText("HomeWeb Logout"));
    await expect(args.handleSignOut).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByRole("button", { name: "Open navigation menu" }));
    await userEvent.click(page.getByText("Google Logout"));
    await expect(args.handleGoogleLogout).toHaveBeenCalledTimes(1);
  },
};

export const SignedOut: Story = {
  args: {
    menuLinks: movieMenuLinks,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Open navigation menu" }));

    expect(page.queryByRole("link", { name: "Filmsuche" })).not.toBeInTheDocument();
    expect(page.queryByText("HomeWeb Logout")).not.toBeInTheDocument();
  },
};

export const GithubUser: Story = {
  args: {
    ...Default.args,
    userEmail: "hans@github.com",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Open navigation menu" }));

    await expect(page.findByText("Github Logout")).resolves.toBeVisible();
    expect(page.queryByText("Google Logout")).not.toBeInTheDocument();

    await userEvent.click(page.getByText("Github Logout"));
    await expect(args.handleGithubLogout).toHaveBeenCalledTimes(1);
  },
};
