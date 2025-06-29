export default {
  displayName: "shared-u",
  preset: "../../jest.preset.js",
  transform: {
    "^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "@nx/react/plugins/jest",
    "^.+\\.[tj]sx?$": ["babel-jest", { presets: ["@nx/react/babel"] }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  coverageDirectory: "../coverage/shared",
  modulePathIgnorePatterns: [
    "<rootDir>/dist/",
    "<rootDir>/libs/dist/",
    "<rootDir>/apps/movies-ui/.next/",
  ],
};
