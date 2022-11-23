/* @flow */
/* eslint import/no-nodejs-modules: off, import/no-default-export: off */

import type { WebpackConfig } from "@krakenjs/webpack-config-grumbler/index.flow";
import { getWebpackConfig } from "@krakenjs/webpack-config-grumbler";

import { testGlobals } from "./test/globals";
import globals from "./globals";

const MODULE_NAME = "paypal";

export const WEBPACK_CONFIG_UI: WebpackConfig = getWebpackConfig({
  context: __dirname,
  entry: "./src/ui",
  filename: "ui",
  modulename: MODULE_NAME,
  web: false,
  minify: false,
  libraryTarget: "commonjs2",
  vars: globals,
});

export const WEBPACK_CONFIG_UI_MIN: WebpackConfig = getWebpackConfig({
  context: __dirname,
  entry: "./src/ui",
  filename: "ui",
  modulename: MODULE_NAME,
  web: false,
  libraryTarget: "commonjs2",
  vars: globals,
});

export const WEBPACK_CONFIG_TEST: WebpackConfig = getWebpackConfig({
  entry: "./test/paypal.js",
  libraryTarget: "window",

  test: true,
  debug: true,
  minify: true,

  vars: {
    ...globals,
    ...testGlobals,
  },
});

export default [WEBPACK_CONFIG_UI, WEBPACK_CONFIG_UI_MIN];
