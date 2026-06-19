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
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
      <div className="app-main-viewport bg-background/95 px-2">
        <div className="mx-auto h-full max-w-6xl overflow-y-auto p-4">
          <UpsertVideoForm
            defaultOwnerId={session.ownerId}
          />
        </div>
      </div>
    );
  }

  const initialValues = await getInitialValues(id);

  return (
    <div className="app-main-viewport bg-background/95 px-2">
      <div className="mx-auto h-full max-w-6xl overflow-y-auto p-4">
        <UpsertVideoForm initialValues={initialValues} />
      </div>
    </div>
  );
}
