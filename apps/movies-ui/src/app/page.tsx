import { MovieComponent } from "../components/movies";
import NavbarComponent from "../components/navbar";
import { isUserAllowed } from "../lib/allowed-user-parser";
import { auth } from "../lib/auth";
import Github from "../components/github";

const getContentBasedOnSession = async () => {
  const session = await auth();
  if (session?.user?.email && isUserAllowed(session.user?.email)) {
    console.log(session);
    return (
      <div className="p-2">
        <MovieComponent session={ session }/>
      </div>
    );
  } else {
    return (
      <div className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="flex flex-col items-center justify-between">
          <div className="sm:text-2xl text-lg">Please sign in first.</div>
          <Github />
        </div>
      </div>
    );
  }
};

export default async function Home() {
  const content = await getContentBasedOnSession();
  return (
    <main>
      <div className="mx-auto container sm:hidden">
      <NavbarComponent></NavbarComponent>
      { content }
      </div>
      <div className="mx-auto sm:block hidden">
      <NavbarComponent></NavbarComponent>
      { content }
      </div>
    </main>
  );
}
