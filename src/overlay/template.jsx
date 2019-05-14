/* @flow */
/** @jsx node */
/* eslint max-lines: off, react/jsx-max-depth: off */

import { isIos, animate, noop, destroyElement, uniqueID } from 'belter/src';
import { EVENT, CONTEXT } from 'zoid/src';
import { node, type ElementNode } from 'jsx-pragmatic/src';
import { LOGO_COLOR, PPLogo, PayPalLogo } from '@paypal/sdk-logos/src';
import type { ZalgoPromise } from 'zalgo-promise/src';

import { getContainerStyle, getSandboxStyle, CLASS } from './style';

export type OverlayProps = {|
    context : $Values<typeof CONTEXT>,
    close : () => ZalgoPromise<void>,
    focus : () => ZalgoPromise<void>,
    event : {
        on : (string, () => ?ZalgoPromise<void>) => void
    },
    frame : ?HTMLElement,
    prerenderFrame : ?HTMLElement,
    content? : {
        windowMessage? : ?string,
        continueMessage? : ?string
    }
|};

// $FlowFixMe
export function Overlay({ context, close, focus, event, frame, prerenderFrame, content = {} } : OverlayProps) : ElementNode {

    const uid = `paypal-overlay-${ uniqueID() }`;

    function closeCheckout(e) {
        e.preventDefault();
        e.stopPropagation();
        close();
    }

    function focusCheckout(e) {
        e.preventDefault();
        e.stopPropagation();

        if (isIos()) {
            // eslint-disable-next-line no-alert
            window.alert('Please switch tabs to reactivate the PayPal window');
        } else {
            focus();
        }
    }

    const setupAnimations = (name) => {
        return (el) => {
            const showContainer = () => animate(el, `show-${ name }`, noop);
            const hideContainer = () => animate(el, `hide-${ name }`, noop);
            event.on(EVENT.DISPLAY, showContainer);
            event.on(EVENT.CLOSE, hideContainer);
        };
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
            <div class={ CLASS.OUTLET } onRender={ setupAnimations('component') }>
                <node el={ frame } />
                <node el={ prerenderFrame } />
            </div>
        );
    }

    return (
        <div id={ uid } onRender={ setupAnimations('container') } class="paypal-checkout-sandbox">
            <style>{ getSandboxStyle({ uid }) }</style>

            <iframe title="PayPal Checkout Overlay" name={ `__paypal_checkout_sandbox_${ uid }__` } scrolling="no" class="paypal-checkout-sandbox-iframe">
                <html>
                    <body>
                        <div id={ uid } onClick={ focusCheckout } class={ `paypal-overlay-context-${ context } paypal-checkout-overlay` }>
                            <a href='#' class="paypal-checkout-close" onClick={ closeCheckout } aria-label="close" role="button" />
                            <div class="paypal-checkout-modal">
                                <div class="paypal-checkout-logo">
                                    <PPLogo logoColor={ LOGO_COLOR.WHITE } />
                                    <PayPalLogo logoColor={ LOGO_COLOR.WHITE } />
                                </div>
                                {content.windowMessage &&
                                    <div class="paypal-checkout-message">
                                        {content.windowMessage}
                                    </div>
                                }
                                {content.continueMessage &&
                                    <div class="paypal-checkout-continue">
                                        <a onClick={ focus } href='#'>{content.continueMessage}</a>
                                    </div>
                                }
                                <div class="paypal-checkout-loader">
                                    <div class="paypal-spinner" />
                                </div>
                            </div>

                            <div class="paypal-checkout-iframe-container">
                                { outlet }
                            </div>

                            <style>{ getContainerStyle({ uid }) }</style>
                        </div>
                    </body>
                </html>
            </iframe>
        </div>
    );
}
