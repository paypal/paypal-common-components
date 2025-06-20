/* @flow */
/* eslint import/no-default-export: off */

import { getKarmaConfig } from "@krakenjs/karma-config-grumbler";

import { WEBPACK_CONFIG_TEST } from "./webpack.config";

// manually set this to true to enable debugging settings
const addDebugSettings = false;

const karmaDebugSettings = {
  // this will open a browser window and run the tests in it
  browsers: ["Chrome"],
  singleRun: false,
  autoWatch: true,
  client: {
    // this will output the console.logs from the browser console to the terminal
    debug: true,
    mocha: {
      // increase timeout to view rendered assets
      timeout: 1000000,
    },
  },
};

const karmaDebugConfig = addDebugSettings ? karmaDebugSettings : {};

export default function configKarma(karma: Object) {
  const karmaConfig = getKarmaConfig(karma, {
    basePath: __dirname,
    testDir: "test",
    windowDir: "test/integration/windows",
    entry: "test/integration/index.js",
    webpack: WEBPACK_CONFIG_TEST,
  });

  karma.set({
    ...karmaConfig,
    ...karmaDebugConfig,

    files: [
      {
        pattern: "test/integration/globals.js",
        included: true,
        served: true,
      },

      {
        pattern: "test/paypal.js",
        included: true,
        served: true,
      },

      ...karmaConfig.files,
    ],

    exclude: ["test/globals.js"],

    preprocessors: {
      ...karmaConfig.preprocessors,

      "src/index.js": ["webpack", "sourcemap"],
      "src/**/*.js": ["sourcemap"],
    },
  });
}
