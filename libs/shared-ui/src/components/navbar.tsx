"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Divider,
  Link,
  Spacer,
  User,
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

  return (
    <Navbar maxWidth="full" onMenuOpenChange={setIsMenuOpen} isMenuOpen={isMenuOpen} isBordered position="sticky">
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
            <User
              avatarProps={{ src: userImage }}
              name={userName}
              description={userEmail} />
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
