import { MovieComponent } from "../components/movies";
import { getAllowedSession } from "./services/actions/getAllowedSession";
import { SignInFirstComponent } from "../components/sign-in-first";


const getContentBasedOnSession = async () => {
  const session = await getAllowedSession();
  if (session) {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-hidden p-2">
        <MovieComponent session={session} />
      </div>
    );
  } else {
    return (<SignInFirstComponent />);
  }
};

export default async function Home() {
  const content = await getContentBasedOnSession();
  return (
    <div className="min-h-0">
      {content}
    </div>
  );
}
