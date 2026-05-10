/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import NavbarComponent from "./navbar";
import { useSession } from "next-auth/react";
import { NavbarComponent as SharedNavbarComponent } from "@nx-movies-db/shared-ui";

jest.mock("@nx-movies-db/shared-ui", () => ({
  NavbarComponent: jest.fn(({ menuLinks }) => (
    <nav>
      {menuLinks.map((menuLink: { href: string; label: string }) => (
        <a href={menuLink.href} key={menuLink.href}>
          {menuLink.label}
        </a>
      ))}
    </nav>
  )),
}));

jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
  useSession: jest.fn(),
}));

const mockUseSession = jest.mocked(useSession);
const mockSharedNavbarComponent = jest.mocked(SharedNavbarComponent);

describe("NavbarComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    expect(mockSharedNavbarComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        menuLinks: expect.arrayContaining([
          { href: "/edit/new", label: "Film hinzufügen" },
          { href: "/info", label: "Info" },
        ]),
        userEmail: "user@example.com",
        userName: "User",
      }),
      undefined,
    );
  });
});
