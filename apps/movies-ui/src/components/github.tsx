"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@heroui-v3/react";


export default function Github() {
  const { data: session } = useSession();

  return (
    <main className="p-2">
      {session ? (
        <div>
          <span className='px-2'>{session.user?.email}</span>
          <Button variant="primary" onPress={() => signOut()}>Sign Out</Button>
        </div>
      ) : (
        <Button variant="primary" onPress={() => signIn()}>Sign In</Button>
      )}
    </main>
  );
}
