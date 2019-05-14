/* @flow */
/* eslint import/no-nodejs-modules: off, import/no-default-export: off */

import { getWebpackConfig } from 'grumbler-scripts/config/webpack.config';

import { testGlobals } from './test/globals';
import globals from './globals';

export const WEBPACK_CONFIG_TEST = getWebpackConfig({
    entry:         './test/paypal.js',
    libraryTarget: 'window',

    test:   true,
    debug:  true,
    minify: true,

    vars: {
        ...globals,
        ...testGlobals,
        __CLIENT_ID__:   'abcxyz123',
        __MERCHANT_ID__: 'abc'
    }
});
