import Github from "../components/github"
import { MovieComponent } from "../components/movies"
import { isUserAllowed } from "../lib/allowed-user-parser"
import { auth } from "../lib/auth"

const getContentBasedOnSession = async () => {
  const session = await auth()
  if (session?.user?.email && isUserAllowed(session.user?.email)) {
    console.log(session)
    return (
      <div>
        <MovieComponent session={ session }/>
      </div>
    )
  } else {
    return (
      <div className="flex min-h-screen flex-col items-center justify-between p-24">
        <Github />
      </div>
    )
  }
}

export default async function Home() {
  const content = await getContentBasedOnSession()
  return (
    <main>
      { content }
    </main>
  )
}
