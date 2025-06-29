import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  stories: ["../src/components/**/*.@(mdx|stories.@(js|jsx|ts|tsx))"],

  core: {
    disableTelemetry: true,
  },

  addons: [
    getAbsolutePath("@storybook/addon-styling-webpack"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-docs")
  ],

  framework: {
    name: getAbsolutePath("@storybook/nextjs-vite"),
    options: {
      builder: {
        viteConfigPath: "vite.config.ts",
      },
    },
  },

  docs: {},

  typescript: {
    reactDocgen: "react-docgen-typescript"
  }
};

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
