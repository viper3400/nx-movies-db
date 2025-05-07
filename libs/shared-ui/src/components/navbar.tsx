"use client";

import { Navbar, NavbarBrand, NavbarContent, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@heroui/navbar";
import { Avatar, Button, Divider, Link, Spacer, User } from "@heroui/react";
import { ThemeSwitch } from "./theme-switch";
import { SceneLogo } from "../icons/icons";
import { useState } from "react";
export interface NavbarComponentProperties {
  isValidSession: boolean;
  userName?: string;
  userImage?: string;
  userEmail?: string;
  handleSignOut: () => void;
  handleGoogleLogout: () => void;
  handleGithubLogout: () => void;
}
export const NavbarComponent = ({
  isValidSession,
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
      <NavbarBrand>
        <SceneLogo />
        <Spacer x={4} />
        <p className="font-bold text-inherit">Filmdatenbank</p>
      </NavbarBrand>

      <NavbarContent justify="end">
        <Button isIconOnly variant="light">
          <Avatar src={userImage} />
        </Button>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu className="place-items-center space-y-4">
        <NavbarMenuItem>
          {
            isValidSession &&
            <User
              avatarProps={{ src: userImage }}
              name={userName}
              description={userEmail} />
          }
        </NavbarMenuItem>
        {
          isValidSession &&
          <>
            <Divider orientation="horizontal" />
            <NavbarMenuItem>
              <Link
                href="/"
                onPress={() => {
                  setIsMenuOpen(false);
                }}>Filmsuche</Link>
            </NavbarMenuItem>
            <Divider orientation="horizontal" />
            <NavbarMenuItem>
              <Link
                href="/seen"
                onPress={() => {
                  setIsMenuOpen(false);
                }}>Gesehene Filme</Link>
            </NavbarMenuItem>
            <Divider orientation="horizontal" />
            <NavbarMenuItem>
              <Link
                href=""
                onPress={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}>HomeWeb Logout</Link>
            </NavbarMenuItem>
            {userEmail?.match(/@(gmail\.com|.*\.google\.com)$/) && (
              <>
                <Divider orientation="horizontal" />
                <NavbarMenuItem>
                  <Link
                    href=""
                    isExternal
                    onPress={() => { handleGoogleLogout(); }}>Google Logout</Link>
                </NavbarMenuItem>
              </>
            )}
            {userEmail?.includes("@github.com") && (
              <>
                <Divider orientation="horizontal" />
                <NavbarMenuItem>
                  <Link
                    href=""
                    isExternal
                    onPress={() => { handleGithubLogout(); }}>Github Logout</Link>
                </NavbarMenuItem>
              </>
            )}
          </>
        }
      </NavbarMenu>
    </Navbar >
  );
};
