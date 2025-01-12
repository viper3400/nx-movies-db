import Github from "./github";

export const SignInFirstComponent = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col items-center justify-between">
        <div className="sm:text-2xl text-lg">Please sign in first.</div>
        <Github />
      </div>
    </div>
  );
};
