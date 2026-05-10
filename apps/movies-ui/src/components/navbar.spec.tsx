/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import NavbarComponent from "./navbar";
import { useSession } from "next-auth/react";

jest.mock("@heroui/react", () => ({
  Navbar: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
  NavbarBrand: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  NavbarContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  NavbarMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  NavbarMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  NavbarMenuToggle: () => <button type="button">Menu</button>,
  Divider: () => <hr />,
  Link: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
  Spacer: () => <span />,
  User: () => <div />,
}));

jest.mock("./theme-switch", () => ({
  ThemeSwitch: () => <button type="button">Theme</button>,
}));

jest.mock("../icons/icons", () => ({
  SceneLogo: () => <span />,
}));

jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
  useSession: jest.fn(),
}));

const mockUseSession = jest.mocked(useSession);

describe("NavbarComponent", () => {
  it("links the add/import menu item to the unified new-entry route", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "User",
          email: "user@example.com",
        },
      },
      status: "authenticated",
      update: jest.fn(),
    });

    render(<NavbarComponent />);

    expect(screen.getByRole("link", { name: "Film hinzufügen" })).toHaveAttribute("href", "/edit/new");
    expect(screen.queryByRole("link", { name: "TMDB Import" })).not.toBeInTheDocument();
  });
});
