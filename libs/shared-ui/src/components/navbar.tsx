"use client";

import {
  Avatar,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Divider,
  Link,
  Spacer,
  Button
} from "@heroui/react";
import { ThemeSwitch } from "./theme-switch";
import { SceneLogo, GithubIcon } from "../icons/icons";
import { Fragment, useState } from "react";

export interface NavbarMenuLink {
  href: string;
  label: string;
}

export interface NavbarComponentProperties {
  brandLabel?: string;
  menuLinks: NavbarMenuLink[];
  userName?: string;
  userImage?: string;
  userEmail?: string;
  handleSignOut?: () => void;
  handleGoogleLogout?: () => void;
  handleGithubLogout?: () => void;
}

export const NavbarComponent = ({
  brandLabel = "Filmdatenbank",
  menuLinks,
  userName,
  userImage,
  userEmail,
  handleSignOut,
  handleGoogleLogout,
  handleGithubLogout
}: NavbarComponentProperties) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userInitials = userName
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <Navbar maxWidth="full" onMenuOpenChange={setIsMenuOpen} isMenuOpen={isMenuOpen} isBordered position="static">
      <NavbarBrand data-testid="NavbarBrand">
        <SceneLogo />
        <Spacer x={4} />
        <p className="font-bold text-inherit">{brandLabel}</p>
      </NavbarBrand>

      <NavbarContent justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"} />
      </NavbarContent>

      <NavbarMenu className="place-items-center space-y-4">
        <NavbarMenuItem>
          {
            userEmail &&
            <div
              data-testid="navbar-user-summary"
              className="flex items-center gap-3 rounded-small border border-default-200 px-3 py-2"
            >
              <Avatar src={userImage} name={userName} size="sm" />
              <div className="min-w-0">
                {userName && (
                  <p className="truncate text-sm font-medium text-foreground">
                    {userName}
                  </p>
                )}
                <p className="truncate text-xs text-default-500">
                  {userEmail}
                </p>
              </div>
              {!userImage && userInitials && (
                <span className="sr-only">{userInitials}</span>
              )}
            </div>
          }
        </NavbarMenuItem>
        {
          userEmail &&
          <>
            {menuLinks.map((menuLink) => (
              <Fragment key={menuLink.href}>
                <Divider orientation="horizontal" />
                <NavbarMenuItem className="w-full md:w-auto">
                  <Button
                    as={Link}
                    href={menuLink.href}
                    variant="flat"
                    className="w-full md:w-48 justify-center"
                    color="primary"
                    onPress={() => {
                      setIsMenuOpen(false);
                    }}>
                    {menuLink.label}
                  </Button>
                </NavbarMenuItem>
              </Fragment>
            ))}
            {handleSignOut && (
              <>
                <Divider orientation="horizontal" />
                <NavbarMenuItem className="w-full md:w-auto">
                  <Button
                    variant="flat"
                    className="w-full md:w-48 justify-center"
                    color="danger"
                    type="button"
                    onPress={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}>
                    HomeWeb Logout
                  </Button>
                </NavbarMenuItem>
              </>
            )}
            {handleGoogleLogout && userEmail.match(/@(gmail\.com|.*\.google\.com)$/) && (
              <>
                <Divider orientation="horizontal" />
                <NavbarMenuItem className="w-full md:w-auto">
                  <Button
                    variant="flat"
                    className="w-full md:w-48 justify-center"
                    color="warning"
                    type="button"
                    onPress={() => {
                      handleGoogleLogout();
                      setIsMenuOpen(false);
                    }}>
                    Google Logout
                  </Button>
                </NavbarMenuItem>
              </>
            )}
            {handleGithubLogout && userEmail.includes("@github.com") && (
              <>
                <Divider orientation="horizontal" />
                <NavbarMenuItem className="w-full md:w-auto">
                  <Button
                    variant="flat"
                    className="w-full md:w-48 justify-center gap-2"
                    color="secondary"
                    type="button"
                    startContent={<GithubIcon size={18} />}
                    onPress={() => {
                      handleGithubLogout();
                      setIsMenuOpen(false);
                    }}>
                    Github Logout
                  </Button>
                </NavbarMenuItem>
              </>
            )}
          </>
        }
      </NavbarMenu>
    </Navbar >
  );
};
