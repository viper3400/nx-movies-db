/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { NavbarComponent } from "./navbar";

jest.mock("./theme-switch", () => ({
  ThemeSwitch: () => <button type="button">Theme</button>,
}));

jest.mock("./navbar-user-summary", () => ({
  NavbarUserSummary: ({
    userName,
    userEmail,
  }: {
    userName?: string;
    userEmail: string;
  }) => (
    <div data-testid="navbar-user-summary">
      {userName}
      {userEmail}
    </div>
  ),
}));

jest.mock("../icons/icons", () => ({
  SceneLogo: () => <span />,
  GithubIcon: () => <span>GH</span>,
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

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));

    expect(screen.getByText("Filmdatenbank")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Filmsuche" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Gesehene Filme" })).toHaveAttribute("href", "/seen");
    expect(screen.getByRole("link", { name: "Film hinzufügen" })).toHaveAttribute("href", "/edit/new");
    expect(screen.getByRole("link", { name: "Info" })).toHaveAttribute("href", "/info");
  });

  it("hides menu links and logout actions when no user email is supplied", () => {
    render(<NavbarComponent menuLinks={menuLinks} />);

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));

    expect(screen.queryByRole("link", { name: "Filmsuche" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "HomeWeb Logout" })).not.toBeInTheDocument();
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

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));

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

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    fireEvent.click(screen.getByText("HomeWeb Logout"));
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    fireEvent.click(screen.getByText("Github Logout"));

    expect(handleSignOut).toHaveBeenCalledTimes(1);
    expect(handleGithubLogout).toHaveBeenCalledTimes(1);
  });
});
