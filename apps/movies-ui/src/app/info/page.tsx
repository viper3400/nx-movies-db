import { InfoPanel } from "../../components/info-panel";
import { SignInFirstComponent } from "../../components/sign-in-first";
import { getAllowedSession } from "../services/actions/getAllowedSession";

export default async function InfoPage() {
  const session = await getAllowedSession();
  if (!session) {
    return (
      <div className="p-4">
        <SignInFirstComponent />
      </div>
    );
  }

  return (
    <div>
      <InfoPanel />
    </div>
  );
}
