import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/components/**/*.@(mdx|stories.@(js|jsx|ts|tsx))"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-interactions", "@storybook/addon-postcss"],
  framework: {
    name: "@storybook/experimental-nextjs-vite",
    options: {
      builder: {
        viteConfigPath: "vite.config.ts",
      },
    },
  },
};

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
