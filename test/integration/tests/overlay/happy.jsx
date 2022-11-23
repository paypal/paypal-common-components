/* @flow */
/** @jsx node */

import { node, dom } from "@krakenjs/jsx-pragmatic/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { Overlay } from "../../../../src/overlay";

describe(`paypal overlay component happy path`, () => {
  const cancel = () => undefined;

  let context = "popup";
  let focussed;

  const close = () => ZalgoPromise.resolve();
  const focus = () => {
    focussed = true;
    return ZalgoPromise.resolve();
  };
  const event = {
    on: () => ({ cancel }),
    once: () => ({ cancel }),
    reset: () => undefined,
    trigger: () => ZalgoPromise.resolve(),
    triggerOnce: () => ZalgoPromise.resolve(),
  };
  const frame = null;
  const prerenderFrame = null;
  const content = {
    windowMessage: "window message",
    continueMessage: "continue message",
  };
  const autoResize = true;
  let hideCloseButton = false;
  const nonce = "abc123";
  let fullScreen = false;

  const getOverlay = () => (
    <Overlay
      context={context}
      content={content}
      close={close}
      focus={focus}
      event={event}
      frame={frame}
      prerenderFrame={prerenderFrame}
      autoResize={autoResize}
      hideCloseButton={hideCloseButton}
      nonce={nonce}
      fullScreen={fullScreen}
    />
  );

  const addOverlayToDOM = (child) => {
    // $FlowFixMe[incompatible-use]
    document.body.appendChild(child);
  };

  const getOverlayContainer = (domNode) => {
    return domNode.querySelector("iframe").contentWindow.document;
  };

  beforeEach(() => {
    // $FlowFixMe[incompatible-use]
    document.body.innerHTML = "";
  });

  it("should render the overlay component", () => {
    const domNode = getOverlay().render(dom());

    if (domNode.ownerDocument !== document) {
      throw new Error(
        `Expected overlay component to be rendered to current dom`
      );
    }
  });

  it("should render the overlay component with popup", () => {
    context = "popup";

    const domNode = getOverlay().render(dom());
    addOverlayToDOM(domNode);

    if (
      !getOverlayContainer(domNode).querySelector(
        ".paypal-overlay-context-popup"
      )
    ) {
      throw new Error(`Expected overlay to have popup`);
    }
  });

  it("should render the overlay component with iframe", () => {
    context = "iframe";

    const domNode = getOverlay().render(dom());
    addOverlayToDOM(domNode);

    if (
      !getOverlayContainer(domNode).querySelector(
        ".paypal-overlay-context-iframe"
      )
    ) {
      throw new Error(`Expected overlay to have iframe`);
    }

    context = "popup"; // reset
  });

  it("should render the overlay component fullscreen", () => {
    fullScreen = true;

    const domNode = getOverlay().render(dom());
    addOverlayToDOM(domNode);

    if (
      !getOverlayContainer(domNode).querySelector(
        ".paypal-checkout-iframe-container-full"
      )
    ) {
      throw new Error(`Expected overlay to be full screen`);
    }
  });

  it("should hide the overlay close button", () => {
    hideCloseButton = true;

    const domNode = getOverlay().render(dom());
    addOverlayToDOM(domNode);

    if (getOverlayContainer(domNode).querySelector(".paypal-checkout-close")) {
      throw new Error(`Expected close button to be hidden`);
    }

    hideCloseButton = false; // reset
  });

  it("should be able to close the overlay using close button", () => {
    const domNode = getOverlay().render(dom());
    addOverlayToDOM(domNode);

    getOverlayContainer(domNode)
      .querySelector(".paypal-checkout-close")
      .click();

    if (
      getOverlayContainer(domNode).querySelector(".paypal-checkout-sandbox")
    ) {
      throw new Error(`Expected overlay to be removed after closing`);
    }
  });

  it("should be able to focus on the overlay by clicking on it", () => {
    const domNode = getOverlay().render(dom());
    addOverlayToDOM(domNode);

    getOverlayContainer(domNode)
      .querySelector(".paypal-checkout-overlay")
      .click();

    if (!focussed) {
      throw new Error(`Expected overlay to be focussed after clicking on it`);
    }

    focussed = null; // reset
  });
});
