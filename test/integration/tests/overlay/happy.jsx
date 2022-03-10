/* @flow */
/** @jsx node */

import { node, dom } from 'jsx-pragmatic/src';
import { ZalgoPromise } from 'zalgo-promise/src';

import { Overlay } from '../../../../src/overlay';

describe(`paypal overlay component happy path`, () => {
    const cancel = () => undefined;

    let context = 'popup';
    const close = () => ZalgoPromise.resolve();
    const focus = () => ZalgoPromise.resolve();
    const event = {
        on:          () => ({ cancel }),
        once:        () => ({ cancel }),
        reset:       () => undefined,
        trigger:     () => ZalgoPromise.resolve(),
        triggerOnce: () => ZalgoPromise.resolve()
    };
    const frame = null;
    const prerenderFrame = null;
    const content = {
        windowMessage:   'window message',
        continueMessage: 'continue message'
    };
    const autoResize = true;
    let hideCloseButton = false;
    const nonce = 'abc123';
    let fullScreen = false;

    const getOverlay = () =>
        (<Overlay
            context={ context }
            content={ content }
            close={ close }
            focus={ focus }
            event={ event }
            frame={ frame }
            prerenderFrame={ prerenderFrame }
            autoResize={ autoResize }
            hideCloseButton={ hideCloseButton }
            nonce={ nonce }
            fullScreen={ fullScreen }
        />);
    
    const addOverlayToDOM = (child) => {
        // $FlowFixMe
        document.body.appendChild(child);
    };

    const getOverlayContainer = (domNode) => {
        // $FlowFixMe
        return domNode.querySelector('iframe').contentWindow.document;
    };

    beforeEach(() => {
        // $FlowFixMe
        document.body.innerHTML = '';
    });

    it('should render the overlay component', () => {
        const domNode = getOverlay().render(dom());

        if (domNode.ownerDocument !== document) {
            throw new Error(`Expected overlay component to be rendered to current dom`);
        }
    });

    it('should render the overlay component with popup', () => {
        context = 'popup';

        const domNode = getOverlay().render(dom());
        addOverlayToDOM(domNode);

        if (!getOverlayContainer(domNode).querySelector('.paypal-overlay-context-popup')) {
            throw new Error(`Expected overlay to have popup`);
        }
    });

    it('should render the overlay component with iframe', () => {
        context = 'iframe';

        const domNode = getOverlay().render(dom());
        addOverlayToDOM(domNode);

        if (!getOverlayContainer(domNode).querySelector('.paypal-overlay-context-iframe')) {
            throw new Error(`Expected overlay to have iframe`);
        }

        context = 'popup'; // reset
    });

    it('should render the overlay component fullscreen', () => {
        fullScreen = true;

        const domNode = getOverlay().render(dom());
        addOverlayToDOM(domNode);

        if (!getOverlayContainer(domNode).querySelector('.paypal-checkout-iframe-container-full')) {
            throw new Error(`Expected overlay to be full screen`);
        }
    });

    it('should hide the overlay close button', () => {
        hideCloseButton = true;

        const domNode = getOverlay().render(dom());
        addOverlayToDOM(domNode);

        if (getOverlayContainer(domNode).querySelector('.paypal-checkout-close')) {
            throw new Error(`Expected close button to be hidden`);
        }
    });
});
