/* @flow */
/** @jsx node */
/* eslint max-lines: off, react/jsx-max-depth: off */

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
  return (
    <div
      id={uid}
      onRender={setupAnimations("container")}
      class="paypal-checkout-sandbox"
    >
      <style nonce={nonce}>{getSandboxStyle({ uid })}</style>
      <iframe
        title="PayPal Checkout Overlay"
        name={overlayIframeName}
        scrolling="no"
        class={`paypal-checkout-sandbox-iframe${fullScreen ? "-full" : ""}`}
      >
        <html>
          <body>
            <div
              dir="auto"
              id={uid}
              onClick={focusCheckout}
              class={`paypal-overlay-context-${context} paypal-checkout-overlay`}
            >
              {!hideCloseButton && (
                <a
                  href="#"
                  class="paypal-checkout-close"
                  onClick={closeCheckout}
                  aria-label="close"
                  role="button"
                />
              )}
              {!fullScreen && (
                <div class="paypal-checkout-modal">
                  <div class="paypal-checkout-logo" dir="ltr">
                    <PayPalRebrandLogo logoColor={LOGO_COLOR.WHITE} />
                  </div>
                  {content.windowMessage && (
                    <div class="paypal-checkout-message">
                      {content.windowMessage}
                    </div>
                  )}
                  <div class="paypal-checkout-focus-warning paypal-checkout-focus-warning-hidden" />
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

  return (
    <div
      id={uid}
      onRender={setupAnimations("container")}
      class="venmo-checkout-sandbox"
    >
      <style nonce={nonce}>{getVenmoSandboxStyle({ uid })}</style>
      <iframe
        title="Venmo Checkout Overlay"
        name={overlayIframeName}
        scrolling="no"
        class={`venmo-checkout-sandbox-iframe${fullScreen ? "-full" : ""}`}
      >
        <html>
          <body>
            <div
              id={uid}
              onClick={focusCheckout}
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
                  <div class="venmo-checkout-focus-warning venmo-checkout-focus-warning-hidden" />
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
                      <a href="#" onClick={closeCheckout} aria-label="close">
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
