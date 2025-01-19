import { SignInFirstComponent } from "../../..//components/sign-in-first";
import { DetailsComponent } from "../../../components/details";
import { getAllowedSession } from "../../services/actions/getAllowedSession";

const getContentBasedOnSession = async (id: string) => {
  const session = await getAllowedSession();
  if (session) {
    return (
      <div className="p-2">
        <DetailsComponent id={ id } userName="jan.graefe"/>
      </div>
    );
  } else {
    return (
      <div className="p-2">
        <SignInFirstComponent />
      </div>
    );
  }
};


export default async function Page( { params,
}: {
  params: Promise<{ id: string }>})
{
  const id = (await params).id;
  const content = (await getContentBasedOnSession(id));
  return (
    <>
      { content }
    </>
  );
}
