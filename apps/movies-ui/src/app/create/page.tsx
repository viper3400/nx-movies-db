import { SignInFirstComponent } from "../..//components/sign-in-first";
import { getAllowedSession } from "../services/actions/getAllowedSession";
import CreateVideoForm from "../../components/create-video-form";

const getContentBasedOnSession = async (id: string) => {
  const session = await getAllowedSession();
  if (!session) {
    return (
      <div className="p-2">
        <SignInFirstComponent />
      </div>
    );
  } else {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <CreateVideoForm />
      </div>
    );
  }
};


export default async function Page({ params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = (await params).id;
  const content = (await getContentBasedOnSession(id));
  return (
    <>
      {content}
    </>
  );
}
