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

  it("should render the 3ds component with vaultToken", () => {
    return wrapPromise(({ expect, avoid }) => {
      const vaultToken = "abc123";
      return window.paypal
        .ThreeDomainSecure({
          createOrder: () => "XXXXXXXXXXXXXXXXX",
          onSuccess: expect("onSuccess"),
          onCancel: avoid("onCancel"),
          onError: avoid("onError"),
          vaultToken,
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

  it("should render the 3ds component with contingecy object", () => {
    return wrapPromise(({ expect, avoid }) => {
      const nonce = "12345";
      window.contingencyResult = {
        success: true,
        liability_shift: "POSSIBLE",
        status: "YES",
        authentication_status_reason: "ERROR",
        authentication_flow: "STEPUP",
      };
      return window.paypal
        .ThreeDomainSecure({
          createOrder: () => "XXXXXXXXXXXXXXXXX",
          onSuccess: expect("onSuccess", (result) => {
            if (!result.liability_shift) {
              throw new Error("missing liability_shift in result");
            }
          }),
          onCancel: avoid("onCancel"),
          onError: avoid("onError"),
          nonce,
        })
        .render("body");
    });
  });

  it("should render onClose if cancel", () => {
    return wrapPromise(({ expect, avoid }) => {
      const nonce = "12345";
      const userType = "UNBRANDED_GUEST";
      window.contingencyResult = {
        success: false,
        liability_shift: "NO",
        status: "NO",
        authentication_status_reason: "FAILURE",
        pageID: "1234",
      };
      return window.paypal
        .ThreeDomainSecure({
          createOrder: () => "XXXXXXXXXXXXXXXXX",
          onSuccess: avoid("onSuccess"),
          onCancel: avoid("onCancel"),
          onError: avoid("onError"),
          onClose: expect("onClose"),
          nonce,
          userType,
        })
        .render("body");
    });
  });

  it("should render onError ", () => {
    return wrapPromise(({ expect, avoid }) => {
      const nonce = "12345";
      window.contingencyResult = {
        success: false,
        liability_shift: "NO",
        status: "NO",
        authentication_status_reason: "FAILURE",
        pageID: "1234",
      };
      return window.paypal
        .ThreeDomainSecure({
          createOrder: () => "XXXXXXXXXXXXXXXXX",
          onSuccess: avoid("onSuccess"),
          onCancel: avoid("onCancel"),
          onError: expect("onError"),
          onClose: avoid("onClose"),
          nonce,
        })
        .render("body");
    });
  });
});
