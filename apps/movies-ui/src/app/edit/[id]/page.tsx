import { UpsertVideoForm } from "../../../components/upsert-video-form";
import { getAllowedSession } from "../../services/actions/getAllowedSession";
import { SignInFirstComponent } from "../../../components/sign-in-first";
import { getMoviesById } from "../../services/actions/getMoviesById";
import type { VideoData } from "@nx-movies-db/shared-types";

async function getInitialValues(id: string): Promise<VideoData | undefined> {
  try {
    const res = await getMoviesById(id, "INCLUDE_DELETED");
    const m = res?.videos[0];
    if (!m) return undefined;
    // Map what we have; remaining fields will use defaults in CreateVideoForm
    const values: VideoData = {
      id: Number(id),
      title: m.title ?? "",
      subtitle: m.subtitle ?? "",
      diskid: m.diskid ?? "",
      plot: m.plot ?? "",
      year: null,
      istv: null,
      lastupdate: null,
      mediatype: null,
      owner_id: null
    };
    return values;
  } catch (_e) {
    return undefined;
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getAllowedSession();
  if (!session) {
    return (
      <div className="p-2">
        <SignInFirstComponent />
      </div>
    );
  }

  const { id } = params;
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
