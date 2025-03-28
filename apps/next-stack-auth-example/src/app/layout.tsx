import { StackProvider, StackTheme } from "@stackframe/stack";
import "./global.css";
import { stackServerApp } from "../../stack";

export const metadata = {
  title: "Welcome to next-stack-auth-example",
  description: "Generated by create-nx-workspace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StackProvider app={stackServerApp}>

          <StackTheme>
            {children}
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
