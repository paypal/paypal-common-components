/* @flow */
/* eslint import/no-default-export: off */

import { getKarmaConfig } from "@krakenjs/karma-config-grumbler";

import { WEBPACK_CONFIG_TEST } from "./webpack.config";

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
