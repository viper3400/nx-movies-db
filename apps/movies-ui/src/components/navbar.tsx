"use client";

import {
  NavbarComponent as SharedNavbarComponent,
  type NavbarMenuLink,
} from "@nx-movies-db/shared-ui";
import { signOut, useSession } from "next-auth/react";

const menuLinks: NavbarMenuLink[] = [
  { href: "/", label: "Filmsuche" },
  { href: "/seen", label: "Gesehene Filme" },
  { href: "/edit/new", label: "Film hinzufügen" },
  { href: "/info", label: "Info" },
];

export default function NavbarComponent() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? undefined;

  return (
    <SharedNavbarComponent
      menuLinks={menuLinks}
      userEmail={userEmail}
      userImage={session?.user?.image ?? undefined}
      userName={session?.user?.name ?? undefined}
      handleSignOut={() => {
        void signOut();
      }}
      handleGoogleLogout={() => {
        void signOut();
        window.open("https://accounts.google.com/Logout");
      }}
      handleGithubLogout={() => {
        void signOut();
        window.open("https://github.com/logout");
      }}
    />
  );
}
