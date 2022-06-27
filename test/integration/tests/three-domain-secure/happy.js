/* @flow */
/* eslint max-lines: 0 */

import { wrapPromise } from "@krakenjs/belter/src";

describe(`paypal 3ds component happy path`, () => {
  it("should render the 3ds component", () => {
    return wrapPromise(({ expect, avoid }) => {
      const nonce = "12345";
      return window.paypal
        .ThreeDomainSecure({
          createOrder: () => "XXXXXXXXXXXXXXXXX",
          onSuccess: expect("onSuccess"),
          onCancel: avoid("onCancel"),
          onError: avoid("onError"),
          nonce,
        })
        .render("body");
    });
  });

  it("should not render the 3ds component", () => {
    return wrapPromise(({ expect, avoid }) => {
      const nonce = "12345";
      window.contingencyResult = {
        success: false,
      };
      return window.paypal
        .ThreeDomainSecure({
          createOrder: () => "XXXXXXXXXXXXXXXXX",
          onSuccess: avoid("onSuccess"),
          onCancel: avoid("onCancel"),
          onError: expect("onError"),
          nonce,
        })
        .render("body");
    });
  });
});
