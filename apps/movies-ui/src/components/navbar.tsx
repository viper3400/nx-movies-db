"use client";

import {  Navbar,   NavbarBrand,   NavbarContent, NavbarMenu, NavbarMenuItem, NavbarMenuToggle} from "@heroui/navbar";
import { Button, Spacer, User } from "@heroui/react";
import { ThemeSwitch } from "./theme-switch";
import { SceneLogo } from "./icons";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
export default function NavbarComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  console.log(session);
  return (
    <Navbar maxWidth="full" onMenuOpenChange={setIsMenuOpen} isBordered position="sticky">
      <NavbarBrand>
        <SceneLogo />
        <Spacer x={4}/>
        <p className="font-bold text-inherit">Filmdatenbank</p>
      </NavbarBrand>

      <NavbarContent justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu className="place-items-center space-y-4">
        <NavbarMenuItem>
          {
            session?.user?.image && session.user.name  &&
          <User
            avatarProps={{src: session?.user?.image   }}
            name={session?.user?.name}
            description={session.user.email} />
          }
        </NavbarMenuItem>
        {
          session  &&
        <NavbarMenuItem>
          <Button  onPress={() => signOut()}>Abmelden</Button>
        </NavbarMenuItem>
        }
      </NavbarMenu>
    </Navbar>
  );
}
