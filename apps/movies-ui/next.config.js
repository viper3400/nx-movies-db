//@ts-check


const { composePlugins, withNx } = require("@nx/next");

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const baseConfig = {
  basePath: process.env.APP_BASE_PATH,
};


// Conditionally add a correctly typed `output` only when requested.
const envOut = process.env.NEXT_OUTPUT ?? "standalone";
/** @type {import('@nx/next/plugins/with-nx').WithNxOptions} */
const nextConfig =
  envOut === "export"
    ? { ...baseConfig, output: "export" }
    : envOut === "server"
      ? baseConfig
      : { ...baseConfig, output: "standalone" };

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
