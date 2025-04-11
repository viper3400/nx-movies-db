import type { Preview } from "@storybook/react";
import "../src/styles.css"; // Make sure this file imports Tailwind
import { Providers } from "./provider";
import React from "react";

const preview: Preview = {
  decorators: [
    (Story) => (
      <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
        <Story />
      </Providers>
    )
  ],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      //theme: themes.light,
    },
  }
};

export default preview;
