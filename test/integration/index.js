/* @flow */

import { insertMockSDKScript } from "@paypal/sdk-client/src";

import "./tests";

window.mockDomain = "mock://www.merchant-site.com";

let originalUserAgent;

beforeEach(() => {
  // eslint-disable-next-line unicorn/prefer-add-event-listener
  window.onerror = () => {
    // pass
  };

  window.__CACHE_START_TIME__ = Date.now();
  originalUserAgent = window.navigator.userAgent;

  insertMockSDKScript();

  delete window.__test__;
});

afterEach(() => {
  window.localStorage.clear();
  delete window.__paypal_storage__;
  delete window.__paypal_global__;

  window.location.hash = "";

  Object.defineProperty(window.navigator, "userAgent", {
    value: originalUserAgent,
    configurable: true,
  });

  delete window.navigator.mockUserAgent;
  delete window.document.documentMode;

  // return window.paypal.destroyAll();
});
