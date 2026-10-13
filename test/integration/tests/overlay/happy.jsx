/* @flow */
/** @jsx node */

import { node, dom } from "@krakenjs/jsx-pragmatic/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";
import { EVENT } from "@krakenjs/zoid/src";

import { Overlay, VenmoOverlay } from "../../../../src/overlay";

// An event mock that records handlers so tests can trigger
// EVENT.DISPLAY / EVENT.CLOSE and assert the overlay's return focus behavior.
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

  it("should move focus to the close button when the window regains focus while displayed", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    const domNode = (
      <Overlay
        context={context}
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={frame}
        prerenderFrame={prerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={fullScreen}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const closeButton = overlayDoc.querySelector(".paypal-checkout-close");

    emit(EVENT.DISPLAY);

    if (overlayDoc.activeElement !== closeButton) {
      throw new Error(
        `Expected close button to be focused when the overlay is displayed`
      );
    }

    // $FlowFixMe[incompatible-use]
    document.body.focus();
    window.dispatchEvent(new Event("focus"));

    if (overlayDoc.activeElement !== closeButton) {
      throw new Error(
        `Expected close button to regain focus when the window regains focus`
      );
    }
  });

  it("should stop moving focus to the overlay after it is closed", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    const domNode = (
      <Overlay
        context={context}
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={frame}
        prerenderFrame={prerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={fullScreen}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const closeButton = overlayDoc.querySelector(".paypal-checkout-close");

    emit(EVENT.DISPLAY);
    emit(EVENT.CLOSE);

    closeButton.blur();
    window.dispatchEvent(new Event("focus"));

    if (overlayDoc.activeElement === closeButton) {
      throw new Error(
        `Expected close button to not be refocused after the overlay is closed`
      );
    }
  });

  it("should stop moving focus to the overlay after DESTROY, even without a prior CLOSE", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    const domNode = (
      <Overlay
        context={context}
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={frame}
        prerenderFrame={prerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={fullScreen}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const closeButton = overlayDoc.querySelector(".paypal-checkout-close");

    emit(EVENT.DISPLAY);
    // zoid can call destroy() directly without ever triggering CLOSE (e.g. an
    // error while opening the component) - the listener must still be removed.
    emit(EVENT.DESTROY);

    closeButton.blur();
    window.dispatchEvent(new Event("focus"));

    if (overlayDoc.activeElement === closeButton) {
      throw new Error(
        `Expected close button to not be refocused after DESTROY`
      );
    }
  });

  it("should trap Tab/Shift+Tab within the overlay's focusable elements", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    const domNode = (
      <Overlay
        context={context}
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={frame}
        prerenderFrame={prerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={fullScreen}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const closeButton = overlayDoc.querySelector(".paypal-checkout-close");
    const continueLink = overlayDoc.querySelector(
      ".paypal-checkout-continue a"
    );

    emit(EVENT.DISPLAY);

    // Tab forward from the last focusable element should wrap to the first.
    continueLink.focus();
    overlayDoc.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));

    if (overlayDoc.activeElement !== closeButton) {
      throw new Error(
        `Expected Tab from the last focusable element to wrap to the close button`
      );
    }

    // Shift+Tab back from the first focusable element should wrap to the last.
    overlayDoc.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", shiftKey: true })
    );

    if (overlayDoc.activeElement !== continueLink) {
      throw new Error(
        `Expected Shift+Tab from the close button to wrap to the continue link`
      );
    }
  });

  it("should keep the checkout iframe reachable via Tab/Shift+Tab", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    // A real checkout iframe and its prerender sibling, exactly as the
    // component renders them via the `frame`/`prerenderFrame` props.
    const checkoutFrame = document.createElement("iframe");
    const checkoutPrerenderFrame = document.createElement("iframe");

    const domNode = (
      <Overlay
        context={context}
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={checkoutFrame}
        prerenderFrame={checkoutPrerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={fullScreen}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const closeButton = overlayDoc.querySelector(".paypal-checkout-close");
    const continueLink = overlayDoc.querySelector(
      ".paypal-checkout-continue a"
    );

    // `.paypal-checkout-iframe-container` is `display: none` outside of
    // context="iframe" - force it visible here to simulate the checkout
    // iframe actually being rendered, without losing the "popup"-context
    // close button/continue link this test also needs.
    overlayDoc.querySelector(
      ".paypal-checkout-iframe-container"
    ).style.display = "block";

    emit(EVENT.DISPLAY);

    // The checkout iframe (and its prerender sibling) render after the
    // continue link, so Tab from the continue link must NOT wrap back to the
    // close button - that would skip over the checkout iframe entirely and
    // strand keyboard users on the shell controls.
    continueLink.focus();
    overlayDoc.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));

    if (overlayDoc.activeElement === closeButton) {
      throw new Error(
        `Expected Tab from the continue link to not skip past the checkout iframe`
      );
    }

    // The true last focusable element (the prerender iframe) should still
    // wrap forward to the first.
    checkoutPrerenderFrame.focus();
    overlayDoc.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));

    if (overlayDoc.activeElement !== closeButton) {
      throw new Error(
        `Expected Tab from the checkout iframe to wrap to the close button`
      );
    }

    // Shift+Tab from the first focusable element should wrap back to the
    // checkout iframe, not the continue link.
    overlayDoc.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", shiftKey: true })
    );

    if (overlayDoc.activeElement !== checkoutPrerenderFrame) {
      throw new Error(
        `Expected Shift+Tab from the close button to wrap to the checkout iframe`
      );
    }
  });

  it("should redirect focus that escapes the checkout iframe back into the overlay", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    // The checkout iframe is cross-origin, so we can
    // never reach into its document to intercept Tab/Shift+Tab directly -
    // instead, once its internal content is exhausted, the browser's own
    // focus traversal moves focus out of the iframe natively. These sentinel
    // elements sit just before/after the overlay's real content to catch
    // that native escape and redirect it back into the trap.
    const checkoutFrame = document.createElement("iframe");
    const checkoutPrerenderFrame = document.createElement("iframe");

    const domNode = (
      <Overlay
        context={context}
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={checkoutFrame}
        prerenderFrame={checkoutPrerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={fullScreen}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const closeButton = overlayDoc.querySelector(".paypal-checkout-close");
    const continueLink = overlayDoc.querySelector(
      ".paypal-checkout-continue a"
    );

    overlayDoc.querySelector(
      ".paypal-checkout-iframe-container"
    ).style.display = "block";

    emit(EVENT.DISPLAY);

    const startSentinel = overlayDoc.querySelector(
      '[data-focus-trap-sentinel="start"]'
    );
    const endSentinel = overlayDoc.querySelector(
      '[data-focus-trap-sentinel="end"]'
    );

    if (!startSentinel || !endSentinel) {
      throw new Error(`Expected the overlay to render its focus sentinels`);
    }

    // Calling .focus() directly on the sentinel is the closest we can get to
    // this scenario at the unit-test level: a real Tab press causes the
    // browser to move focus here natively once the iframe's content is
    // exhausted, but dispatching a synthetic KeyboardEvent doesn't trigger
    // that native focus traversal (only trusted, OS-level keypresses do).
    // This still verifies the sentinel's own redirect logic correctly - it
    // just can't exercise the native browser mechanism that would land focus
    // here in a real Tab press.
    //
    // Simulate the browser's native focus traversal moving focus out of the
    // checkout iframe's exhausted content forward onto the end sentinel -
    // this should redirect back to the first focusable element.
    endSentinel.focus();

    if (overlayDoc.activeElement !== closeButton) {
      throw new Error(
        `Expected focus reaching the end sentinel to redirect to the close button`
      );
    }

    // Simulate the same escape happening backward (Shift+Tab out of the
    // iframe's own first control) onto the start sentinel - this should
    // redirect back to the last focusable element (the checkout iframe).
    startSentinel.focus();

    if (overlayDoc.activeElement !== checkoutPrerenderFrame) {
      throw new Error(
        `Expected focus reaching the start sentinel to redirect to the checkout iframe`
      );
    }

    // Tab from the continue link - a normal mid-sequence element, not a
    // trap boundary - must be left alone by the keydown trap.
    continueLink.focus();
    overlayDoc.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));

    if (overlayDoc.activeElement !== continueLink) {
      throw new Error(
        `Expected Tab from the continue link to be left untouched by the trap`
      );
    }
  });

  it("should stop trapping Tab/Shift+Tab after the overlay is closed", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    const domNode = (
      <Overlay
        context={context}
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={frame}
        prerenderFrame={prerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={fullScreen}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const continueLink = overlayDoc.querySelector(
      ".paypal-checkout-continue a"
    );

    emit(EVENT.DISPLAY);
    emit(EVENT.CLOSE);

    if (overlayDoc.querySelector("[data-focus-trap-sentinel]")) {
      throw new Error(
        `Expected focus trap sentinels to be removed after the overlay is closed`
      );
    }

    continueLink.focus();
    overlayDoc.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));

    if (overlayDoc.activeElement !== continueLink) {
      throw new Error(
        `Expected Tab to no longer be trapped after the overlay is closed`
      );
    }
  });

  it("should stop trapping Tab/Shift+Tab after DESTROY, even without a prior CLOSE", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    const domNode = (
      <Overlay
        context={context}
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={frame}
        prerenderFrame={prerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={fullScreen}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const continueLink = overlayDoc.querySelector(
      ".paypal-checkout-continue a"
    );

    emit(EVENT.DISPLAY);
    // zoid can call destroy() directly without ever triggering CLOSE (e.g. an
    // error while opening the component) - the keydown listener must still be removed.
    emit(EVENT.DESTROY);

    continueLink.focus();
    overlayDoc.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));

    if (overlayDoc.activeElement !== continueLink) {
      throw new Error(`Expected Tab to no longer be trapped after DESTROY`);
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

  it("should move focus to the close button when the window regains focus while displayed", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    const domNode = (
      <VenmoOverlay
        context={context}
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={frame}
        prerenderFrame={prerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={fullScreen}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const closeButton = overlayDoc.querySelector(".venmo-checkout-close a");

    emit(EVENT.DISPLAY);

    if (overlayDoc.activeElement !== closeButton) {
      throw new Error(
        `Expected close button to be focused when the overlay is displayed`
      );
    }

    // $FlowFixMe[incompatible-use]
    document.body.focus();
    window.dispatchEvent(new Event("focus"));

    if (overlayDoc.activeElement !== closeButton) {
      throw new Error(
        `Expected close button to regain focus when the window regains focus`
      );
    }
  });

  it("should stop moving focus to the overlay after it is closed", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    const domNode = (
      <VenmoOverlay
        context={context}
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={frame}
        prerenderFrame={prerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={fullScreen}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const closeButton = overlayDoc.querySelector(".venmo-checkout-close a");

    emit(EVENT.DISPLAY);
    emit(EVENT.CLOSE);

    closeButton.blur();
    window.dispatchEvent(new Event("focus"));

    if (overlayDoc.activeElement === closeButton) {
      throw new Error(
        `Expected close button to not be refocused after the overlay is closed`
      );
    }
  });

  it("should stop moving focus to the overlay after DESTROY, even without a prior CLOSE", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    const domNode = (
      <VenmoOverlay
        context={context}
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={frame}
        prerenderFrame={prerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={fullScreen}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const closeButton = overlayDoc.querySelector(".venmo-checkout-close a");

    emit(EVENT.DISPLAY);
    // zoid can call destroy() directly without ever triggering CLOSE (e.g. an
    // error while opening the component) - the listener must still be removed.
    emit(EVENT.DESTROY);

    closeButton.blur();
    window.dispatchEvent(new Event("focus"));

    if (overlayDoc.activeElement === closeButton) {
      throw new Error(
        `Expected close button to not be refocused after DESTROY`
      );
    }
  });

  it("should trap Tab/Shift+Tab within the overlay's focusable elements", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    const domNode = (
      <VenmoOverlay
        context={context}
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={frame}
        prerenderFrame={prerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={fullScreen}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const closeButton = overlayDoc.querySelector(".venmo-checkout-close a");
    const continueLink = overlayDoc.querySelector(".venmo-checkout-continue a");

    emit(EVENT.DISPLAY);

    // Venmo's markup renders the continue link before the close button, so
    // the close button is the last focusable element, not the first.
    // Tab forward from the last focusable element should wrap to the first.
    closeButton.focus();
    overlayDoc.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));

    if (overlayDoc.activeElement !== continueLink) {
      throw new Error(
        `Expected Tab from the last focusable element to wrap to the continue link`
      );
    }

    // Shift+Tab back from the first focusable element should wrap to the last.
    overlayDoc.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", shiftKey: true })
    );

    if (overlayDoc.activeElement !== closeButton) {
      throw new Error(
        `Expected Shift+Tab from the continue link to wrap to the close button`
      );
    }
  });

  it("should keep the checkout iframe reachable via Tab/Shift+Tab", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    // A real checkout iframe and its prerender sibling, exactly as the
    // component renders them via the `frame`/`prerenderFrame` props.
    const checkoutFrame = document.createElement("iframe");
    const checkoutPrerenderFrame = document.createElement("iframe");

    const domNode = (
      <VenmoOverlay
        context={context}
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={checkoutFrame}
        prerenderFrame={checkoutPrerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={fullScreen}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const closeButton = overlayDoc.querySelector(".venmo-checkout-close a");
    const continueLink = overlayDoc.querySelector(".venmo-checkout-continue a");

    // `.venmo-checkout-iframe-container` is `display: none` outside of
    // context="iframe" - force it visible here to simulate the checkout
    // iframe actually being rendered, without losing the "popup"-context
    // close button/continue link this test also needs.
    overlayDoc.querySelector(".venmo-checkout-iframe-container").style.display =
      "block";

    emit(EVENT.DISPLAY);

    // The checkout iframe (and its prerender sibling) render after the
    // close button (Venmo's last shell control), so Tab from the close
    // button must NOT wrap back to the first shell control - that would skip
    // over the checkout iframe entirely and strand keyboard users on the
    // shell controls.
    closeButton.focus();
    overlayDoc.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));

    if (overlayDoc.activeElement === continueLink) {
      throw new Error(
        `Expected Tab from the close button to not skip past the checkout iframe`
      );
    }

    // The true last focusable element (the prerender iframe) should still
    // wrap forward to the first.
    checkoutPrerenderFrame.focus();
    overlayDoc.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));

    if (overlayDoc.activeElement !== continueLink) {
      throw new Error(
        `Expected Tab from the checkout iframe to wrap to the continue link`
      );
    }

    // Shift+Tab from the first focusable element should wrap back to the
    // checkout iframe, not the close button.
    overlayDoc.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", shiftKey: true })
    );

    if (overlayDoc.activeElement !== checkoutPrerenderFrame) {
      throw new Error(
        `Expected Shift+Tab from the continue link to wrap to the checkout iframe`
      );
    }
  });

  it("should redirect focus that escapes the checkout iframe back into the overlay", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    // The checkout iframe is cross-origin, so we can
    // never reach into its document to intercept Tab/Shift+Tab directly -
    // instead, once its internal content is exhausted, the browser's own
    // focus traversal moves focus out of the iframe natively. These sentinel
    // elements sit just before/after the overlay's real content to catch
    // that native escape and redirect it back into the trap.
    const checkoutFrame = document.createElement("iframe");
    const checkoutPrerenderFrame = document.createElement("iframe");

    const domNode = (
      <VenmoOverlay
        context={context}
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={checkoutFrame}
        prerenderFrame={checkoutPrerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={fullScreen}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const closeButton = overlayDoc.querySelector(".venmo-checkout-close a");
    const continueLink = overlayDoc.querySelector(".venmo-checkout-continue a");

    overlayDoc.querySelector(".venmo-checkout-iframe-container").style.display =
      "block";

    emit(EVENT.DISPLAY);

    const startSentinel = overlayDoc.querySelector(
      '[data-focus-trap-sentinel="start"]'
    );
    const endSentinel = overlayDoc.querySelector(
      '[data-focus-trap-sentinel="end"]'
    );

    if (!startSentinel || !endSentinel) {
      throw new Error(`Expected the overlay to render its focus sentinels`);
    }

    // Calling .focus() directly on the sentinel is the closest we can get to
    // this scenario at the unit-test level: a real Tab press causes the
    // browser to move focus here natively once the iframe's content is
    // exhausted, but dispatching a synthetic KeyboardEvent doesn't trigger
    // that native focus traversal (only trusted, OS-level keypresses do).
    // This still verifies the sentinel's own redirect logic correctly - it
    // just can't exercise the native browser mechanism that would land focus
    // here in a real Tab press.
    //
    // Simulate the browser's native focus traversal moving focus out of the
    // checkout iframe's exhausted content forward onto the end sentinel -
    // this should redirect back to the first focusable element.
    endSentinel.focus();

    if (overlayDoc.activeElement !== continueLink) {
      throw new Error(
        `Expected focus reaching the end sentinel to redirect to the continue link`
      );
    }

    // Simulate the same escape happening backward (Shift+Tab out of the
    // iframe's own first control) onto the start sentinel - this should
    // redirect back to the last focusable element (the checkout iframe).
    startSentinel.focus();

    if (overlayDoc.activeElement !== checkoutPrerenderFrame) {
      throw new Error(
        `Expected focus reaching the start sentinel to redirect to the checkout iframe`
      );
    }

    // Tab from the close button - a normal mid-sequence element, not a
    // trap boundary - must be left alone by the keydown trap.
    closeButton.focus();
    overlayDoc.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));

    if (overlayDoc.activeElement !== closeButton) {
      throw new Error(
        `Expected Tab from the close button to be left untouched by the trap`
      );
    }
  });

  it("should stop trapping Tab/Shift+Tab after the overlay is closed", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    const domNode = (
      <VenmoOverlay
        context={context}
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={frame}
        prerenderFrame={prerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={fullScreen}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const closeButton = overlayDoc.querySelector(".venmo-checkout-close a");

    emit(EVENT.DISPLAY);
    emit(EVENT.CLOSE);

    closeButton.focus();
    overlayDoc.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));

    if (overlayDoc.activeElement !== closeButton) {
      throw new Error(
        `Expected Tab to no longer be trapped after the overlay is closed`
      );
    }
  });

  it("should stop trapping Tab/Shift+Tab after DESTROY, even without a prior CLOSE", () => {
    const { event: controllableEvent, emit } = createControllableEvent();

    const domNode = (
      <VenmoOverlay
        context={context}
        content={content}
        close={close}
        focus={focus}
        event={controllableEvent}
        frame={frame}
        prerenderFrame={prerenderFrame}
        autoResize={autoResize}
        hideCloseButton={false}
        nonce={nonce}
        fullScreen={fullScreen}
      />
    ).render(dom());
    addOverlayToDOM(domNode);

    const overlayDoc = getOverlayContainer(domNode);
    const closeButton = overlayDoc.querySelector(".venmo-checkout-close a");

    emit(EVENT.DISPLAY);
    // zoid can call destroy() directly without ever triggering CLOSE (e.g. an
    // error while opening the component) - the keydown listener must still be removed.
    emit(EVENT.DESTROY);

    closeButton.focus();
    overlayDoc.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));

    if (overlayDoc.activeElement !== closeButton) {
      throw new Error(`Expected Tab to no longer be trapped after DESTROY`);
    }
  });
});
