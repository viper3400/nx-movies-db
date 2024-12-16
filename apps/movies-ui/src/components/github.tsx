'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@nextui-org/react'
import { auth } from '../lib/auth';


export default function Github() {
  const { data: session } = useSession()
  console.log(session);

  return (
    <main className="p-2">
      {session ? (
        <div>
          <span>{session.user?.email}</span>
          <Button onPress={() => signOut()} disabled={false}>Sign Out</Button>
        </div>
      ) : (
        <Button onPress={() => signIn()} disabled={false}>Sign In</Button>
      )}
    </main>
  )
}
