/* @flow */
/** @jsx node */

import { node, dom } from "@krakenjs/jsx-pragmatic/src";

import { SpinnerPage } from "../../../../src/ui";

describe(`paypal spinner component happy path`, () => {
  it("should render the spinner component", () => {
    const spinnerPage = <SpinnerPage />;

    const domNode = spinnerPage.render(dom());

    if (domNode.ownerDocument !== document) {
      throw new Error(
        `Expected spinner component to be rendered to current dom`
      );
    }
  });

  it("should render the spinner component with children", () => {
    const spinnerPage = (
      <SpinnerPage>
        <div id="spinnerchild" />
      </SpinnerPage>
    );

    const domNode = spinnerPage.render(dom());

    if (!domNode.querySelector("#spinnerchild")) {
      throw new Error(`Expected spinner to have child`);
    }
  });

  it("should render the spinner component with nonce", () => {
    const nonce = "12345";
    const spinnerPage = <SpinnerPage nonce={nonce} />;

    const domNode = spinnerPage.render(dom());

    if (domNode.ownerDocument !== document) {
      throw new Error(
        `Expected spinner component to be rendered to current dom`
      );
    }
  });
});
