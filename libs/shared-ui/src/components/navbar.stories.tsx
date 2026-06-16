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

    const menuToggle = canvas.getByTestId("navbar-menu-toggle");
    await userEvent.click(menuToggle);

    const menuOverlay = await page.findByTestId("navbar-menu-overlay");
    const overlay = within(menuOverlay);

    await expect(overlay.findByText("Hans Dampf")).resolves.toBeVisible();
    await expect(overlay.findByRole("link", { name: "Filmsuche" })).resolves.toHaveAttribute("href", "/");
    await expect(overlay.findByRole("link", { name: "Gesehene Filme" })).resolves.toHaveAttribute("href", "/seen");
    await expect(overlay.findByRole("link", { name: "Film hinzufügen" })).resolves.toHaveAttribute("href", "/edit/new");
    await expect(overlay.findByRole("link", { name: "Info" })).resolves.toHaveAttribute("href", "/info");
    expect(overlay.queryByText("Github Logout")).not.toBeInTheDocument();

    const closeButton = overlay.getByTestId("navbar-menu-close");
    await userEvent.click(closeButton);
    expect(page.queryByTestId("navbar-menu-overlay")).not.toBeInTheDocument();

    await userEvent.click(menuToggle);
    const reopenedOverlay = within(await page.findByTestId("navbar-menu-overlay"));
    await userEvent.click(reopenedOverlay.getByText("HomeWeb Logout"));
    await expect(args.handleSignOut).toHaveBeenCalledTimes(1);

    await userEvent.click(menuToggle);
    const reopenedOverlayForGoogle = within(await page.findByTestId("navbar-menu-overlay"));
    await userEvent.click(reopenedOverlayForGoogle.getByText("Google Logout"));
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

    const menuToggle = canvas.getByTestId("navbar-menu-toggle");
    await userEvent.click(menuToggle);

    const menuOverlay = await page.findByTestId("navbar-menu-overlay");
    const overlay = within(menuOverlay);

    expect(overlay.queryByRole("link", { name: "Filmsuche" })).not.toBeInTheDocument();
    expect(overlay.queryByText("HomeWeb Logout")).not.toBeInTheDocument();
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

    const menuToggle = canvas.getByTestId("navbar-menu-toggle");
    await userEvent.click(menuToggle);

    const menuOverlay = await page.findByTestId("navbar-menu-overlay");
    const overlay = within(menuOverlay);

    await expect(overlay.findByText("Github Logout")).resolves.toBeVisible();
    expect(overlay.queryByText("Google Logout")).not.toBeInTheDocument();

    await userEvent.click(overlay.getByText("Github Logout"));
    await expect(args.handleGithubLogout).toHaveBeenCalledTimes(1);
  },
};
