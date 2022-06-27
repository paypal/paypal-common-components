/* @flow */
/** @jsx node */

import {
  node,
  type ElementNode,
  type ChildrenType,
} from "@krakenjs/jsx-pragmatic/src";

const spinnerStyle = `

    body {
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: fixed;
        top: 0;
        left: 0;
        margin: 0;
    }

    .spinner {
        height: 100%;
        width: 100%;
        position: absolute;
        z-index: 10
    }

    .spinner .spinWrap {
        width: 200px;
        height: 100px;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: -100px;
        margin-top: -50px
    }

    .spinner .loader,
    .spinner .spinnerImage {
        height: 100px;
        width: 100px;
        position: absolute;
        top: 0;
        left: 50%;
        opacity: 1;
        filter: alpha(opacity=100)
    }

    .spinner .spinnerImage {
        margin: 28px 0 0 -25px;
        background: url(https://www.paypalobjects.com/images/checkout/hermes/icon_ot_spin_lock_skinny.png) no-repeat
    }

    .spinner .loader {
        margin: 0 0 0 -55px;
        background-color: transparent;
        animation: rotation .7s infinite linear;
        border-left: 5px solid #cbcbca;
        border-right: 5px solid #cbcbca;
        border-bottom: 5px solid #cbcbca;
        border-top: 5px solid #2380be;
        border-radius: 100%
    }

    @keyframes rotation {
        from {
            transform: rotate(0deg)
        }
        to {
            transform: rotate(359deg)
        }
    }
`;

export function Spinner({ nonce }: {| nonce: ?string |}): ElementNode {
  return (
    <div class="preloader spinner">
      <style nonce={nonce} innerHTML={spinnerStyle} />

      <div class="spinWrap">
        <p class="spinnerImage" />
        <p class="loader" />
      </div>
    </div>
  );
}

export function SpinnerPage(
  { nonce }: {| nonce: ?string |},
  children: ChildrenType
): ElementNode {
  return (
    <html>
      <head>
        <title>PayPal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Spinner nonce={nonce} />
        {children}
      </body>
    </html>
  );
}
