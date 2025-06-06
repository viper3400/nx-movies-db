"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@heroui/react";


export default function Github() {
  const { data: session } = useSession();

  return (
    <main className="p-2">
      {session ? (
        <div>
          <span className='px-2'>{session.user?.email}</span>
          <Button color="primary" onPress={() => signOut()} disabled={false}>Sign Out</Button>
        </div>
      ) : (
        <Button color="primary" onPress={() => signIn()} disabled={false}>Sign In</Button>
      )}
    </main>
  );
}
