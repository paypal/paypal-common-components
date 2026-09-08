/* @flow */
/** @jsx node */
/* eslint max-lines: off, react/jsx-max-depth: off */

// Polyfill `inert` for browsers that predate native support
// (native `inert` is ~2022+; v5 supports much older browsers).
// The polyfill self-guards. On browsers with native `inert`, it installs nothing
// (no property patch, observer, or style injection), so modern browsers pay only
// the bundled parse cost. `setupBackgroundInert` below sets `el.inert`, which the
// polyfill reflects to aria-hidden + tabindex on unsupported browsers.
// It is imported for its side effect only.
// eslint-disable-next-line import/no-unassigned-import
import "wicg-inert";
import {
  isIos,
  isIpadOs,
  isFirefox,
  animate,
  noop,
  destroyElement,
  uniqueID,
  supportsPopups,
  type EventEmitterType,
  toCSS,
} from "@krakenjs/belter/src";
import { EVENT, CONTEXT } from "@krakenjs/zoid/src";
import { node, type ElementNode } from "@krakenjs/jsx-pragmatic/src";
import {
  LOGO_COLOR,
  PayPalRebrandLogo,
  VenmoLogo,
} from "@paypal/sdk-logos/src";
import { type ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import {
  getContainerStyle,
  getSandboxStyle,
  getVenmoContainerStyle,
  getVenmoSandboxStyle,
  CLASS,
} from "./style";

// The checkout overlay is only a visual layer over the merchant
// page. The page content behind it stays in the accessibility tree and the
// tab order. When the overlay is shown, mark every other top-level element in
// the render window as `inert` so assistive technology and keyboard focus stay
// within the overlay; restore them when it closes. `inert` removes elements
// from both the a11y tree and the tab order.
//
// `el` is the overlay container node, which lives in the render/merchant
// window. We operate on `el.ownerDocument` rather than the global `document`.
function setupBackgroundInert(el: HTMLElement, event: EventEmitterType) {
  const ownerDocument = el.ownerDocument;
  const body = ownerDocument && ownerDocument.body;

  if (!body) {
    return;
  }

  // Walk up to the overlay's top-level element under <body> so we inert its
  // siblings rather than the overlay itself.
  const getOverlayRoot = () => {
    let current = el;
    while (current.parentElement && current.parentElement !== body) {
      current = current.parentElement;
    }
    return current.parentElement === body ? current : null;
  };

  let inerted = [];

  const applyInert = () => {
    const overlayRoot = getOverlayRoot();
    if (!overlayRoot) {
      return;
    }
    inerted = Array.prototype.slice
      .call(body.children)
      .filter((child) => child !== overlayRoot && !child.inert);
    inerted.forEach((child) => {
      child.inert = true;
    });
  };

  const removeInert = () => {
    inerted.forEach((child) => {
      child.inert = false;
    });
    inerted = [];
  };

  event.on(EVENT.DISPLAY, applyInert);
  event.on(EVENT.CLOSE, removeInert);
}

// Move keyboard/AT focus into the overlay when it is displayed so
// the buyer lands on the overlay's controls instead of staying on the (now
// inert) merchant page. Prefers the close button; falls back to the sandbox
// iframe, which is focusable and carries an accessible title.
function setupInitialFocus(
  event: EventEmitterType,
  getFocusTarget: () => ?HTMLElement
) {
  event.on(EVENT.DISPLAY, () => {
    const focusTarget = getFocusTarget();
    if (focusTarget) {
      try {
        focusTarget.focus();
      } catch (err) {
        // focus() can throw in rare cross-frame situations; ignore.
      }
    }
  });
}

export type OverlayProps = {|
  context: $Values<typeof CONTEXT>,
  close: () => ZalgoPromise<void>,
  focus: () => ZalgoPromise<void>,
  event: EventEmitterType,
  frame: ?HTMLElement,
  prerenderFrame: ?HTMLElement,
  content?: void | {|
    windowMessage?: string,
    continueMessage?: string,
    cancelMessage?: string,
    interrogativeMessage?: string,
  |},
  autoResize?: boolean,
  hideCloseButton?: boolean,
  nonce: string,
  fullScreen?: boolean,
  isUnbrandedFlow?: boolean, // eslint-disable-line react/no-unused-prop-types
|};

export function Overlay({
  context,
  close,
  focus,
  event,
  frame,
  prerenderFrame,
  content = {},
  autoResize,
  hideCloseButton,
  nonce,
  fullScreen = false,
  isUnbrandedFlow = false,
}: OverlayProps): ElementNode {
  const uid = `paypal-overlay-${uniqueID()}`;
  const overlayIframeName = `__paypal_checkout_sandbox_${uid}__`;

  function closeCheckout(e) {
    e.preventDefault();
    e.stopPropagation();
    close();
  }

  function displayFocusWarning() {
    const overlayIframe: ?HTMLIFrameElement =
      //  $FlowFixMe
      document.getElementsByName(overlayIframeName)?.[0];
    const iframeDocument = overlayIframe?.contentWindow.document;
    const warningElement = iframeDocument?.getElementsByClassName(
      "paypal-checkout-focus-warning-hidden"
    )?.[0];

    if (!warningElement) {
      return;
    }
    warningElement.innerText = `Still can't see it? Select "Window" in your toolbar to find "Log in to your PayPal account"`;
    warningElement.classList.remove("paypal-checkout-focus-warning-hidden");
  }

  function focusCheckout(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!supportsPopups()) {
      return;
    }

    if (isIos() || isIpadOs()) {
      // Note: alerts block the event loop until they are closed.
      // eslint-disable-next-line no-alert
      window.alert("Please switch tabs to reactivate the PayPal window");
    } else if (isFirefox()) {
      displayFocusWarning();
    }
    focus();
  }

  const setupAnimations = (name) => {
    return (el) => {
      const showContainer = () => animate(el, `show-${name}`, noop);
      const hideContainer = () => animate(el, `hide-${name}`, noop);
      event.on(EVENT.DISPLAY, showContainer);
      event.on(EVENT.CLOSE, hideContainer);
    };
  };

  const setupAutoResize = (el) => {
    event.on(EVENT.RESIZE, ({ width: newWidth, height: newHeight }) => {
      if (typeof newWidth === "number") {
        el.style.width = toCSS(newWidth);
      }

      if (typeof newHeight === "number") {
        el.style.height = toCSS(newHeight);
      }
    });
  };

  const outletOnRender = (el) => {
    setupAnimations("component")(el);
    if (autoResize) {
      setupAutoResize(el);
    }
  };

  let outlet;

  if (frame && prerenderFrame) {
    frame.classList.add(CLASS.COMPONENT_FRAME);
    prerenderFrame.classList.add(CLASS.PRERENDER_FRAME);

    prerenderFrame.classList.add(CLASS.VISIBLE);
    frame.classList.add(CLASS.INVISIBLE);

    event.on(EVENT.RENDERED, () => {
      prerenderFrame.classList.remove(CLASS.VISIBLE);
      prerenderFrame.classList.add(CLASS.INVISIBLE);

      frame.classList.remove(CLASS.INVISIBLE);
      frame.classList.add(CLASS.VISIBLE);

      setTimeout(() => {
        destroyElement(prerenderFrame);
      }, 1);
    });

    outlet = (
      <div class={CLASS.OUTLET} onRender={outletOnRender}>
        <node el={frame} />
        <node el={prerenderFrame} />
      </div>
    );
  }

  let closeButtonEl: ?HTMLElement;
  let sandboxIframeEl: ?HTMLElement;

  const containerOnRender = (el) => {
    setupAnimations("container")(el);
    setupBackgroundInert(el, event);
  };

  setupInitialFocus(event, () => closeButtonEl || sandboxIframeEl);

  return (
    <div id={uid} onRender={containerOnRender} class="paypal-checkout-sandbox">
      <style nonce={nonce}>{getSandboxStyle({ uid })}</style>
      <iframe
        title="PayPal Checkout Overlay"
        name={overlayIframeName}
        scrolling="no"
        onRender={(el) => {
          sandboxIframeEl = el;
        }}
        class={`paypal-checkout-sandbox-iframe${fullScreen ? "-full" : ""}`}
      >
        <html>
          <body>
            <div
              dir="auto"
              id={uid}
              onClick={focusCheckout}
              role="dialog"
              aria-modal="true"
              aria-label={content.windowMessage || "PayPal Checkout"}
              class={`paypal-overlay-context-${context} paypal-checkout-overlay`}
            >
              {!hideCloseButton && (
                <a
                  href="#"
                  class="paypal-checkout-close"
                  onClick={closeCheckout}
                  onRender={(el) => {
                    closeButtonEl = el;
                  }}
                  aria-label="close"
                  role="button"
                />
              )}
              {!fullScreen && (
                <div class="paypal-checkout-modal">
                  {/* Cannot have any PayPal branding for unbranded flows */}
                  {isUnbrandedFlow ? null : (
                    <div class="paypal-checkout-logo" dir="ltr">
                      <PayPalRebrandLogo logoColor={LOGO_COLOR.WHITE} />
                    </div>
                  )}
                  {content.windowMessage && (
                    <div class="paypal-checkout-message">
                      {content.windowMessage}
                    </div>
                  )}
                  <div
                    role="alert"
                    class="paypal-checkout-focus-warning paypal-checkout-focus-warning-hidden"
                  />
                  {content.continueMessage && (
                    <div class="paypal-checkout-continue">
                      {/* This handler should be guarded with e.stopPropagation. 
                          This will stop the event from bubbling up to the overlay click handler
                          and causing unexpected behavior. */}
                      <a onClick={focusCheckout} href="#">
                        {content.continueMessage}
                      </a>
                    </div>
                  )}
                  <div class="paypal-checkout-loader">
                    <div class="paypal-spinner" />
                  </div>
                </div>
              )}
              <div
                class={
                  fullScreen
                    ? "paypal-checkout-iframe-container-full"
                    : "paypal-checkout-iframe-container"
                }
              >
                {outlet}
              </div>

              <style nonce={nonce}>{getContainerStyle({ uid })}</style>
            </div>
          </body>
        </html>
      </iframe>
    </div>
  );
}

export function VenmoOverlay({
  context,
  close,
  focus,
  event,
  frame,
  prerenderFrame,
  content = {},
  autoResize,
  hideCloseButton,
  nonce,
  fullScreen = false,
}: OverlayProps): ElementNode {
  const uid = `venmo-overlay-${uniqueID()}`;
  const overlayIframeName = `__venmo_checkout_sandbox_${uid}__`;

  function closeCheckout(e) {
    e.preventDefault();
    e.stopPropagation();
    close();
  }

  function displayFocusWarningVenmo() {
    const overlayIframe: ?HTMLIFrameElement =
      // $FlowFixMe
      document.getElementsByName(overlayIframeName)?.[0];
    const iframeDocument = overlayIframe?.contentWindow.document;
    const warningElement = iframeDocument?.getElementsByClassName(
      "venmo-checkout-focus-warning-hidden"
    )?.[0];

    if (!warningElement) {
      return;
    }

    warningElement.innerText = `Still can't see it? Select "Window" in your toolbar to find "Log in to your Venmo account"`;
    warningElement.classList.remove("venmo-checkout-focus-warning-hidden");
  }

  function focusCheckout(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!supportsPopups()) {
      return;
    }

    if (isIos()) {
      // Note: alerts block the event loop until they are closed.
      // eslint-disable-next-line no-alert
      window.alert("Please switch tabs to reactivate the Venmo window");
    } else if (isFirefox()) {
      displayFocusWarningVenmo();
    }
    focus();
  }

  const setupAnimations = (name) => {
    return (el) => {
      const showContainer = () => animate(el, `show-${name}`, noop);
      const hideContainer = () => animate(el, `hide-${name}`, noop);
      event.on(EVENT.DISPLAY, showContainer);
      event.on(EVENT.CLOSE, hideContainer);
    };
  };

  const setupAutoResize = (el) => {
    event.on(EVENT.RESIZE, ({ width: newWidth, height: newHeight }) => {
      if (typeof newWidth === "number") {
        el.style.width = toCSS(newWidth);
      }

      if (typeof newHeight === "number") {
        el.style.height = toCSS(newHeight);
      }
    });
  };

  const outletOnRender = (el) => {
    setupAnimations("component")(el);
    if (autoResize) {
      setupAutoResize(el);
    }
  };

  let outlet;

  if (frame && prerenderFrame) {
    frame.classList.add(CLASS.COMPONENT_FRAME);
    prerenderFrame.classList.add(CLASS.PRERENDER_FRAME);

    prerenderFrame.classList.add(CLASS.VISIBLE);
    frame.classList.add(CLASS.INVISIBLE);

    event.on(EVENT.RENDERED, () => {
      prerenderFrame.classList.remove(CLASS.VISIBLE);
      prerenderFrame.classList.add(CLASS.INVISIBLE);

      frame.classList.remove(CLASS.INVISIBLE);
      frame.classList.add(CLASS.VISIBLE);

      setTimeout(() => {
        destroyElement(prerenderFrame);
      }, 1);
    });

    outlet = (
      <div class={CLASS.OUTLET} onRender={outletOnRender}>
        <node el={frame} />
        <node el={prerenderFrame} />
      </div>
    );
  }

  let closeButtonEl: ?HTMLElement;
  let sandboxIframeEl: ?HTMLElement;

  const containerOnRender = (el) => {
    setupAnimations("container")(el);
    setupBackgroundInert(el, event);
  };

  setupInitialFocus(event, () => closeButtonEl || sandboxIframeEl);

  return (
    <div id={uid} onRender={containerOnRender} class="venmo-checkout-sandbox">
      <style nonce={nonce}>{getVenmoSandboxStyle({ uid })}</style>
      <iframe
        title="Venmo Checkout Overlay"
        name={overlayIframeName}
        scrolling="no"
        onRender={(el) => {
          sandboxIframeEl = el;
        }}
        class={`venmo-checkout-sandbox-iframe${fullScreen ? "-full" : ""}`}
      >
        <html>
          <body>
            <div
              id={uid}
              onClick={focusCheckout}
              role="dialog"
              aria-modal="true"
              aria-label={
                content.interrogativeMessage ||
                content.windowMessage ||
                "Venmo Checkout"
              }
              class={`venmo-overlay-context-${context} venmo-checkout-overlay`}
            >
              {!fullScreen && (
                <div class="venmo-checkout-modal">
                  <div class="venmo-checkout-logo">
                    <VenmoLogo logoColor={LOGO_COLOR.WHITE} />
                  </div>
                  {content.interrogativeMessage && (
                    <div class="venmo-interrogative-message">
                      {content.interrogativeMessage}
                    </div>
                  )}
                  <div
                    role="alert"
                    class="venmo-checkout-focus-warning venmo-checkout-focus-warning-hidden"
                  />
                  {content.windowMessage && (
                    <div class="venmo-checkout-message">
                      {content.windowMessage}
                    </div>
                  )}
                  {content.continueMessage && (
                    <div class="venmo-checkout-continue">
                      {/* This handler should be guarded with e.stopPropagation.
                          This will stop the event from bubbling up to the overlay click handler
                          and causing unexpected behavior. */}
                      <a onClick={focusCheckout} href="#">
                        {content.continueMessage}
                      </a>
                    </div>
                  )}
                  {content.cancelMessage && !hideCloseButton && (
                    <div class="venmo-checkout-close">
                      <a
                        href="#"
                        onClick={closeCheckout}
                        onRender={(el) => {
                          closeButtonEl = el;
                        }}
                        aria-label="close"
                      >
                        {content.cancelMessage}
                      </a>
                    </div>
                  )}
                  <div class="venmo-checkout-loader">
                    <div class="venmo-spinner" />
                  </div>
                </div>
              )}
              <div
                class={
                  fullScreen
                    ? "venmo-checkout-iframe-container-full"
                    : "venmo-checkout-iframe-container"
                }
              >
                {outlet}
              </div>

              <style nonce={nonce}>{getVenmoContainerStyle({ uid })}</style>
            </div>
          </body>
        </html>
      </iframe>
    </div>
  );
}
