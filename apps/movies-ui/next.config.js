//@ts-check


const { composePlugins, withNx } = require("@nx/next");

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const baseConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  basePath: process.env.APP_BASE_PATH,
};

// Conditionally add a correctly typed `output` only when requested.
const envOut = process.env.NEXT_OUTPUT;
/** @type {import('@nx/next/plugins/with-nx').WithNxOptions} */
const nextConfig =
  envOut === 'standalone'
    ? { ...baseConfig, output: 'standalone' }
    : envOut === 'export'
      ? { ...baseConfig, output: 'export' }
      : baseConfig;

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
