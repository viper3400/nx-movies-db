import type { Preview } from "@storybook/react";
import "../src/styles.css"; // Make sure this file imports Tailwind
import { Providers } from "./provider";
import React from "react";
import i18n from "../src/i18n/i18n";

const preview: Preview = {
  decorators: [
    (Story, context) => {
      // Update the language when the locale changes
      React.useEffect(() => {
        const locale = context.globals.locale;
        i18n.changeLanguage(locale); // Change the language in i18n
      }, [context.globals.locale]);

      return (
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <Story />
        </Providers>
      );
    },
  ],

  globalTypes: {
    locale: {
      description: "Internationalization locale",
      toolbar: {
        icon: "globe",
        items: [
          { value: "en", right: "🇺🇸", title: "English" },
          //{ value: "fr", right: "🇫🇷", title: "Français" },
          //{ value: "es", right: "🇪🇸", title: "Español" },
          //{ value: "zh", right: "🇨🇳", title: "中文" },
          //{ value: "kr", right: "🇰🇷", title: "한국어" },
          { value: "de", right: "🇩🇪", title: "Deutsch" },
        ],
      },
    },
  },

  initialGlobals: {
    locale: "en",
  },

  parameters: {
    actions: {
      handles: ["onClick", "onSubmit", "onChange"], // Add the actions relevant to your project
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      //theme: themes.light,
    },
  },

  tags: ["autodocs"]
};

export default preview;
