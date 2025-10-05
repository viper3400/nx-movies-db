"use client";

import { Navbar, NavbarBrand, NavbarContent, NavbarMenu, NavbarMenuItem, NavbarMenuToggle } from "@heroui/navbar";
import { Divider, Link, Spacer, User } from "@heroui/react";
import { ThemeSwitch } from "./theme-switch";
import { SceneLogo } from "../icons/icons";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

export default function NavbarComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <Navbar maxWidth="full" onMenuOpenChange={setIsMenuOpen} isMenuOpen={isMenuOpen} isBordered position="sticky">
      <NavbarBrand data-test="NavbarBrand">
        <SceneLogo />
        <Spacer x={4} />
        <p className="font-bold text-inherit">Filmdatenbank</p>
      </NavbarBrand>

      <NavbarContent justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu className="place-items-center space-y-4">
        <NavbarMenuItem>
          {
            session?.user?.image && session.user.name &&
            <User
              avatarProps={{ src: session?.user?.image }}
              name={session?.user?.name}
              description={session.user.email} />
          }
        </NavbarMenuItem>
        {
          session &&
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
                  signOut();
                  setIsMenuOpen(false);
                }}>HomeWeb Logout</Link>
            </NavbarMenuItem>
            {session?.user?.email?.match(/@(gmail\.com|.*\.google\.com)$/) && (
              <>
                <Divider orientation="horizontal" />
                <NavbarMenuItem>
                  <Link
                    href=""
                    isExternal
                    onPress={() => { signOut(); window.open("https://accounts.google.com/Logout"); }}>Google Logout</Link>
                </NavbarMenuItem>
              </>
            )}
            {session?.user?.email?.includes("@github.com") && (
              <>
                <Divider orientation="horizontal" />
                <NavbarMenuItem>
                  <Link
                    href=""
                    isExternal
                    onPress={() => { signOut(); window.open("https://github.com/logout",); }}>Github Logout</Link>
                </NavbarMenuItem>
              </>
            )}
          </>
        }
      </NavbarMenu>
    </Navbar >
  );
}
