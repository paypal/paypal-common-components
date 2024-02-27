/* @flow */

import { setupSDK } from "@paypal/sdk-client/src";

import * as paypalCheckout from "../src/interface"; // eslint-disable-line import/no-namespace

document.currentScript?.setAttribute(
  "src",
  "test.paypal.com/sdk/js?client-id=abcxyz123"
);

window.mockDomain = "mock://www.paypal.com";

setupSDK([
  {
    name: "paypal-checkout",
    requirer: () => paypalCheckout,
  },
]);
