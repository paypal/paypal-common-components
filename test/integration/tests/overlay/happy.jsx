/* @flow */
/** @jsx node */

import { node, dom } from "@krakenjs/jsx-pragmatic/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { EVENT } from "@krakenjs/zoid/src";

import { Overlay, VenmoOverlay } from "../../../../src/overlay";

// Raw source of the inert polyfill, so a test can evaluate a fresh copy and
// force its non-native code path (see "overlay inert polyfill path" below).
// $FlowFixMe[cannot-resolve-module]
import inertPolyfillSource from "!!raw-loader!wicg-inert/dist/inert.js"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions

// An event mock that records handlers so tests can trigger
// EVENT.DISPLAY / EVENT.CLOSE and assert the overlay's a11y side effects
// (background inert, initial focus). `event` matches EventEmitterType; `emit`
// is returned separately so the event object stays type-compatible.
const createControllableEvent = () => {
  const handlers = {};
  const event = {
    on: (name, handler) => {
      handlers[name] = handlers[name] || [];
      handlers[name].push(handler);
      return { cancel: () => undefined };
    },
    once: () => ({ cancel: () => undefined }),
    reset: () => undefined,
    trigger: () => ZalgoPromise.resolve(),
    triggerOnce: () => ZalgoPromise.resolve(),
  };
  const emit = (name) => (handlers[name] || []).forEach((handler) => handler());
  return { event, emit };
};

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

    fullScreen = false; // reset
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

  it("should show PayPal logo by default (branded flow)", () => {
    const domNode = getOverlay().render(dom());
    addOverlayToDOM(domNode);

    if (!getOverlayContainer(domNode).querySelector(".paypal-checkout-logo")) {
      throw new Error(`Expected PayPal logo to be shown in branded flow`);
    }
  });

  it("should hide PayPal logo for unbranded flow", () => {
    const getUnbrandedOverlay = () => (
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
        isUnbrandedFlow={true}
      />
    );

    const domNode = getUnbrandedOverlay().render(dom());
    addOverlayToDOM(domNode);

    if (getOverlayContainer(domNode).querySelector(".paypal-checkout-logo")) {
      throw new Error(`Expected PayPal logo to be hidden in unbranded flow`);
    }
  });

  it("renders the overlay as an accessible dialog", () => {
    const domNode = getOverlay().render(dom());
    addOverlayToDOM(domNode);

    const overlay = getOverlayContainer(domNode).querySelector(
      ".paypal-checkout-overlay"
    );

    if (overlay.getAttribute("role") !== "dialog") {
      throw new Error(`Expected overlay to have role="dialog"`);
    }
    if (overlay.getAttribute("aria-modal") !== "true") {
      throw new Error(`Expected overlay to have aria-modal="true"`);
    }
    if (!overlay.getAttribute("aria-label")) {
      throw new Error(`Expected overlay to have an aria-label`);
    }
  });

  it("marks the focus warning as an alert region", () => {
    const domNode = getOverlay().render(dom());
    addOverlayToDOM(domNode);

    const warning = getOverlayContainer(domNode).querySelector(
      ".paypal-checkout-focus-warning"
    );

    if (!warning || warning.getAttribute("role") !== "alert") {
      throw new Error(`Expected focus warning to have role="alert"`);
    }
  });

  it("makes background content inert while displayed and restores on close", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    const sibling = document.createElement("div");
    // $FlowFixMe[incompatible-use]
    document.body.appendChild(sibling);

    const domNode = (
      <Overlay
        context="popup"
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={frame}
        prerenderFrame={prerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={false}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    if (sibling.hasAttribute("inert")) {
      throw new Error(`Expected sibling to not be inert before display`);
    }

    emit(EVENT.DISPLAY);

    if (!sibling.hasAttribute("inert")) {
      throw new Error(
        `Expected sibling to be inert while overlay is displayed`
      );
    }
    if (domNode.hasAttribute("inert")) {
      throw new Error(`Expected the overlay root to not be inert`);
    }

    emit(EVENT.CLOSE);

    if (sibling.hasAttribute("inert")) {
      throw new Error(`Expected sibling inert to be cleared on close`);
    }
  });

  it("moves focus into the overlay when displayed", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    const domNode = (
      <Overlay
        context="popup"
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={frame}
        prerenderFrame={prerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={false}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const closeButton = overlayDoc.querySelector(".paypal-checkout-close");

    emit(EVENT.DISPLAY);

    if (overlayDoc.activeElement !== closeButton) {
      throw new Error(`Expected focus to move to the overlay close button`);
    }
  });
});

describe(`venmo overlay component happy path`, () => {
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
    cancelMessage: "cancel message",
    interrogativeMessage: "interrogative message",
  };
  const autoResize = true;
  let hideCloseButton = false;
  const nonce = "abc123";
  let fullScreen = false;

  const getOverlay = () => (
    <VenmoOverlay
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
        ".venmo-overlay-context-popup"
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
        ".venmo-overlay-context-iframe"
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
        ".venmo-checkout-iframe-container-full"
      )
    ) {
      throw new Error(`Expected overlay to be full screen`);
    }

    fullScreen = false; // reset
  });

  it("should hide the overlay close button", () => {
    hideCloseButton = true;

    const domNode = getOverlay().render(dom());
    addOverlayToDOM(domNode);

    if (getOverlayContainer(domNode).querySelector(".venmo-checkout-close")) {
      throw new Error(`Expected close button to be hidden`);
    }

    hideCloseButton = false; // reset
  });

  it("should be able to close the overlay using close button", () => {
    const domNode = getOverlay().render(dom());
    addOverlayToDOM(domNode);

    getOverlayContainer(domNode).querySelector(".venmo-checkout-close").click();

    if (getOverlayContainer(domNode).querySelector(".venmo-checkout-sandbox")) {
      throw new Error(`Expected overlay to be removed after closing`);
    }
  });

  it("should be able to focus on the overlay by clicking on it", () => {
    const domNode = getOverlay().render(dom());
    addOverlayToDOM(domNode);

    getOverlayContainer(domNode)
      .querySelector(".venmo-checkout-overlay")
      .click();

    if (!focussed) {
      throw new Error(`Expected overlay to be focussed after clicking on it`);
    }

    focussed = null; // reset
  });

  it("renders the venmo overlay as an accessible dialog", () => {
    const domNode = getOverlay().render(dom());
    addOverlayToDOM(domNode);

    const overlay = getOverlayContainer(domNode).querySelector(
      ".venmo-checkout-overlay"
    );

    if (overlay.getAttribute("role") !== "dialog") {
      throw new Error(`Expected overlay to have role="dialog"`);
    }
    if (overlay.getAttribute("aria-modal") !== "true") {
      throw new Error(`Expected overlay to have aria-modal="true"`);
    }
    if (!overlay.getAttribute("aria-label")) {
      throw new Error(`Expected overlay to have an aria-label`);
    }
  });

  it("marks the venmo focus warning as an alert region", () => {
    const domNode = getOverlay().render(dom());
    addOverlayToDOM(domNode);

    const warning = getOverlayContainer(domNode).querySelector(
      ".venmo-checkout-focus-warning"
    );

    if (!warning || warning.getAttribute("role") !== "alert") {
      throw new Error(`Expected focus warning to have role="alert"`);
    }
  });

  it("makes background content inert while displayed and restores on close", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    const sibling = document.createElement("div");
    // $FlowFixMe[incompatible-use]
    document.body.appendChild(sibling);

    const domNode = (
      <VenmoOverlay
        context="popup"
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={frame}
        prerenderFrame={prerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={false}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    if (sibling.hasAttribute("inert")) {
      throw new Error(`Expected sibling to not be inert before display`);
    }

    emit(EVENT.DISPLAY);

    if (!sibling.hasAttribute("inert")) {
      throw new Error(
        `Expected sibling to be inert while overlay is displayed`
      );
    }
    if (domNode.hasAttribute("inert")) {
      throw new Error(`Expected the overlay root to not be inert`);
    }

    emit(EVENT.CLOSE);

    if (sibling.hasAttribute("inert")) {
      throw new Error(`Expected sibling inert to be cleared on close`);
    }
  });
});

// Exercise the *non-native* inert path. Headless Chrome has native
// `inert`, so the polyfill bundled into the overlay self-guards to a no-op. Here
// we remove native support and evaluate a fresh copy of the polyfill so it
// actually installs, then assert it neutralizes background content
// (aria-hidden on the root, tabindex removal on descendants).
describe(`overlay inert polyfill path`, () => {
  const close = () => ZalgoPromise.resolve();
  const focus = () => ZalgoPromise.resolve();
  const content = { windowMessage: "window message" };
  const nonce = "abc123";

  beforeEach(() => {
    // $FlowFixMe[incompatible-use]
    document.body.innerHTML = "";
  });

  it("neutralises background content when native inert is unavailable", () => {
    const nativeInert = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "inert"
    );

    try {
      // Simulate a browser without native inert, then install the polyfill
      // fresh so its (otherwise self-guarded) code path runs.
      // $FlowFixMe[prop-missing]
      delete HTMLElement.prototype.inert;
      // eslint-disable-next-line no-new-func
      new Function(inertPolyfillSource)();

      const { event: controllableEvent, emit } = createControllableEvent();

      const sibling = document.createElement("div");
      const backgroundButton = document.createElement("button");
      sibling.appendChild(backgroundButton);
      // $FlowFixMe[incompatible-use]
      document.body.appendChild(sibling);

      const domNode = (
        <Overlay
          context="popup"
          content={content}
          close={close}
          focus={focus}
          event={controllableEvent}
          frame={null}
          prerenderFrame={null}
          autoResize={false}
          hideCloseButton={false}
          nonce={nonce}
          fullScreen={false}
        />
      ).render(dom());
      // $FlowFixMe[incompatible-use]
      document.body.appendChild(domNode);

      emit(EVENT.DISPLAY);

      if (sibling.getAttribute("aria-hidden") !== "true") {
        throw new Error(
          `Expected background content to be aria-hidden via the inert polyfill`
        );
      }
      if (backgroundButton.getAttribute("tabindex") !== "-1") {
        throw new Error(
          `Expected background focusable to be removed from the tab order`
        );
      }

      emit(EVENT.CLOSE);

      if (sibling.getAttribute("aria-hidden") === "true") {
        throw new Error(`Expected aria-hidden to be cleared on close`);
      }
      if (backgroundButton.getAttribute("tabindex") === "-1") {
        throw new Error(`Expected tab order to be restored on close`);
      }
    } finally {
      // Best-effort restore of native inert. The polyfill installs a
      // non-configurable property, so this may not succeed; this describe runs
      // last and the polyfill is a faithful implementation, so it is harmless.
      if (nativeInert) {
        try {
          // $FlowFixMe[prop-missing]
          Object.defineProperty(HTMLElement.prototype, "inert", nativeInert);
        } catch (err) {
          // ignore
        }
      }
    }
  });
});
