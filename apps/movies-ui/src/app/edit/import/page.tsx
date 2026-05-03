import { TmdbImport } from "../../../components/tmdb-import";
import { SignInFirstComponent } from "../../../components/sign-in-first";
import { getAllowedSession } from "../../services/actions/getAllowedSession";

export default async function Page() {
  const session = await getAllowedSession();
  if (!session) {
    return (
      <div className="p-2">
        <SignInFirstComponent />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">TMDB Import</h1>
      </div>
      <TmdbImport />
    </div>
  );
}
