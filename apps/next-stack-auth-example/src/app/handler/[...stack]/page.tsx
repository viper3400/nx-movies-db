import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "apps/next-stack-auth-example/stack";
export default function Handler(props: unknown) {
  return <StackHandler fullPage app={stackServerApp} routeProps={props} />;
}
