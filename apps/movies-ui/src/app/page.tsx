import { MovieComponent } from "../components/movies";
import { getAllowedSession } from "./services/actions/getAllowedSession";
import { SignInFirstComponent } from "../components/sign-in-first";

const getContentBasedOnSession = async () => {
  const session = await getAllowedSession();
  if (session) {
    console.log(session);
    return (
      <div className="p-2">
        <MovieComponent session={session} />
      </div>
    );
  } else {
    return <SignInFirstComponent />;
  }
};

export default async function Home() {
  const content = await getContentBasedOnSession();
  return <div>{content}</div>;
}
