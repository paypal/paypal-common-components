/* @flow */
/* eslint unicorn/filename-case: 0, import/unambiguous: 0, import/no-commonjs: 0 */

const globals = require("./globals");

module.exports = {
  common: {
    automatic: true,
    entry: "./src/interface",
    globals,
  },
};
