/* @flow */
/** @jsx node */

import {
  node,
  Fragment,
  type ElementNode,
  type ChildrenType,
  type ComponentNode,
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
        color: official;
        display: inline-block;
        width: 80px;
        height: 80px;
        position: absolute;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
    }
    .spinner div {
        transform-origin: 40px 40px;
        animation: spinner 1.2s linear infinite;
    }
    .spinner div:after {
        content: " ";
        display: block;
        position: absolute;
        top: 20px;
        left: 37px;
        width: 3px;
        height: 10px;
        border-radius: 30%;
        background: #808080;
    }
    .spinner div:nth-child(1) {
        transform: rotate(0deg);
        animation-delay: -1.1s;
    }
    .spinner div:nth-child(2) {
        transform: rotate(30deg);
        animation-delay: -1s;
    }
    .spinner div:nth-child(3) {
        transform: rotate(60deg);
        animation-delay: -0.9s;
    }
    .spinner div:nth-child(4) {
        transform: rotate(90deg);
        animation-delay: -0.8s;
    }
    .spinner div:nth-child(5) {
        transform: rotate(120deg);
        animation-delay: -0.7s;
    }
    .spinner div:nth-child(6) {
        transform: rotate(150deg);
        animation-delay: -0.6s;
    }
    .spinner div:nth-child(7) {
        transform: rotate(180deg);
        animation-delay: -0.5s;
    }
    .spinner div:nth-child(8) {
        transform: rotate(210deg);
        animation-delay: -0.4s;
    }
    .spinner div:nth-child(9) {
        transform: rotate(240deg);
        animation-delay: -0.3s;
    }
    .spinner div:nth-child(10) {
        transform: rotate(270deg);
        animation-delay: -0.2s;
    }
    .spinner div:nth-child(11) {
        transform: rotate(300deg);
        animation-delay: -0.1s;
    }
    .spinner div:nth-child(12) {
        transform: rotate(330deg);
        animation-delay: 0s;
    }
    @keyframes spinner {
        0% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }
`;

export function VenmoSpinner({
  nonce,
}: {|
  nonce: ?string,
|}): ComponentNode<{||}> {
  return (
    <Fragment>
      <style nonce={nonce} innerHTML={spinnerStyle} />

      <div class="spinner">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </Fragment>
  );
}

export function VenmoSpinnerPage(
  { nonce }: {| nonce: ?string |},
  children: ChildrenType
): ElementNode {
  return (
    <html>
      <head>
        <title>Venmo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <VenmoSpinner nonce={nonce} />
        {children}
      </body>
    </html>
  );
}
