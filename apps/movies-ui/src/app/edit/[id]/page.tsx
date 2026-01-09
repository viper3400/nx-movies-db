import { UpsertVideoForm } from "../../../components/upsert-video-form";
import { getAllowedSession } from "../../services/actions/getAllowedSession";
import { SignInFirstComponent } from "../../../components/sign-in-first";
import { getVideoData } from "../../services/actions";
import type { VideoData } from "@nx-movies-db/shared-types";

async function getInitialValues(id: string): Promise<VideoData | undefined> {
  try {
    const video = await getVideoData(Number(id));
    return video;
  } catch (_e) {
    return undefined;
  }
}

// In Next.js 15, params can be a Promise in App Router.
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAllowedSession();
  if (!session) {
    return (
      <div className="p-2">
        <SignInFirstComponent />
      </div>
    );
  }

  // If id is 'new', render a blank form to create a new entry
  if (id === "new") {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <UpsertVideoForm />
      </div>
    );
  }

  const initialValues = await getInitialValues(id);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <UpsertVideoForm initialValues={initialValues} />
    </div>
  );
}
