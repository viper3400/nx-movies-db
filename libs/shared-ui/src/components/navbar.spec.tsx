/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { NavbarComponent } from "./navbar";

jest.mock("@heroui/react", () => ({
  Navbar: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
  NavbarBrand: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  NavbarContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  NavbarMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  NavbarMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  NavbarMenuToggle: () => <button type="button">Menu</button>,
  Divider: () => <hr />,
  Link: ({
    children,
    href,
    onPress,
  }: {
    children: React.ReactNode;
    href: string;
    onPress?: () => void;
  }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onPress?.();
      }}
    >
      {children}
    </a>
  ),
  Spacer: () => <span />,
  User: ({ name, description }: { name?: string; description?: string }) => (
    <div>
      {name}
      {description}
    </div>
  ),
}));

jest.mock("./theme-switch", () => ({
  ThemeSwitch: () => <button type="button">Theme</button>,
}));

jest.mock("../icons/icons", () => ({
  SceneLogo: () => <span />,
}));

const menuLinks = [
  { href: "/", label: "Filmsuche" },
  { href: "/seen", label: "Gesehene Filme" },
  { href: "/edit/new", label: "Film hinzufügen" },
  { href: "/info", label: "Info" },
];

describe("NavbarComponent", () => {
  it("renders the supplied authenticated menu links", () => {
    render(
      <NavbarComponent
        menuLinks={menuLinks}
        userEmail="user@example.com"
        userName="User"
      />,
    );

    expect(screen.getByText("Filmdatenbank")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Filmsuche" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Gesehene Filme" })).toHaveAttribute("href", "/seen");
    expect(screen.getByRole("link", { name: "Film hinzufügen" })).toHaveAttribute("href", "/edit/new");
    expect(screen.getByRole("link", { name: "Info" })).toHaveAttribute("href", "/info");
  });

  it("hides menu links and logout actions when no user email is supplied", () => {
    render(<NavbarComponent menuLinks={menuLinks} />);

    expect(screen.queryByRole("link", { name: "Filmsuche" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "HomeWeb Logout" })).not.toBeInTheDocument();
  });

  it("renders provider-specific logout actions based on the user email", () => {
    render(
      <NavbarComponent
        menuLinks={menuLinks}
        userEmail="user@gmail.com"
        handleGoogleLogout={jest.fn()}
        handleGithubLogout={jest.fn()}
      />,
    );

    expect(screen.getByText("Google Logout")).toBeInTheDocument();
    expect(screen.queryByText("Github Logout")).not.toBeInTheDocument();
  });

  it("calls logout handlers from menu actions", () => {
    const handleSignOut = jest.fn();
    const handleGithubLogout = jest.fn();

    render(
      <NavbarComponent
        menuLinks={menuLinks}
        userEmail="user@github.com"
        handleSignOut={handleSignOut}
        handleGithubLogout={handleGithubLogout}
      />,
    );

    fireEvent.click(screen.getByText("HomeWeb Logout"));
    fireEvent.click(screen.getByText("Github Logout"));

    expect(handleSignOut).toHaveBeenCalledTimes(1);
    expect(handleGithubLogout).toHaveBeenCalledTimes(1);
  });
});
