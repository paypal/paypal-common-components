/* @flow */
/** @jsx node */
/* eslint max-lines: 0 */

import { node, dom } from "@krakenjs/jsx-pragmatic/src";
import { create, type ZoidComponent } from "@krakenjs/zoid/src";
import { inlineMemoize, noop } from "@krakenjs/belter/src";
import { getSDKMeta, getClientID, getCSPNonce } from "@paypal/sdk-client/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { Overlay } from "../overlay";
import { getThreeDomainSecureUrl } from "../config";

export type TDSResult = {||};

export const USER_TYPE = {
  BRANDED_GUEST: ("BRANDED_GUEST": "BRANDED_GUEST"), // inline guest flow
  UNBRANDED_GUEST: ("UNBRANDED_GUEST": "UNBRANDED_GUEST"), // UCC
  MEMBER: ("MEMBER": "MEMBER"),
};

export type TDSProps = {|
  action: string,
  xcomponent: string,
  flow: string,
  orderID: string,
  onSuccess: (TDSResult) => void,
  onError: (mixed) => void,
  sdkMeta: string,
  content?: void | {|
    windowMessage?: string,
    continueMessage?: string,
    cancelMessage?: string,
    interrogativeMessage?: string,
  |},
  userType: ?$Values<typeof USER_TYPE>,
  nonce: string,
|};

export type TDSComponent = ZoidComponent<TDSProps>;

export function getThreeDomainSecureComponent(): TDSComponent {
  return inlineMemoize(getThreeDomainSecureComponent, () => {
    const component = create({
      tag: "three-domain-secure",
      url: getThreeDomainSecureUrl,

      attributes: {
        iframe: {
          scrolling: "no",
        },
      },

      containerTemplate: ({
        context,
        focus,
        close,
        frame,
        prerenderFrame,
        doc,
        event,
        props,
      }) => {
        return (
          <Overlay
            context={context}
            close={close}
            focus={focus}
            event={event}
            frame={frame}
            prerenderFrame={prerenderFrame}
            content={props.content}
            nonce={props.nonce}
          />
        ).render(dom({ doc }));
      },

      props: {
        action: {
          type: "string",
          queryParam: true,
          value: (data) => (data.props.action ? data.props.action : "verify"),
        },
        xcomponent: {
          type: "string",
          queryParam: true,
          value: () => "1",
        },
        flow: {
          type: "string",
          queryParam: true,
          value: () => "3ds",
        },
        createOrder: {
          type: "function",
          queryParam: "cart_id",
          // $FlowFixMe[incompatible-call]
          queryValue: ({ value }) => ZalgoPromise.try(value),
          required: false,
        },
        vaultToken: {
          type: "string",
          queryParam: "token",
          // We do not need to add queryValue here.
          // This code has gone through E2E approval and so we are keeping it as a safeguard
          // Refer zoid documentation for further clarity.
          queryValue: ({ value }) => value,
          required: false,
        },
        clientID: {
          type: "string",
          value: getClientID,
          queryParam: true,
        },
        onSuccess: {
          type: "function",
          alias: "onContingencyResult",
          decorate: ({ props, value, onError }) => {
            return (err, result) => {
              const isCardFieldFlow = props?.userType === "UNBRANDED_GUEST";

              // HostedFields ONLY rejects when the err object is not null. The below implementation ensures that CardFields follows the same pattern.

              const hasError = isCardFieldFlow
                ? Boolean(err)
                : // $FlowFixMe[incompatible-use]
                  Boolean(err) || result?.success === false;

              if (hasError) {
                return onError(err);
              }

              return value(result);
            };
          },
        },
        sdkMeta: {
          type: "string",
          queryParam: true,
          sendToChild: false,
          value: getSDKMeta,
        },
        content: {
          type: "object",
          required: false,
        },
        userType: {
          type: "string",
          required: false,
        },
        nonce: {
          type: "string",
          default: getCSPNonce,
        },
      },
    });

    if (component.isChild()) {
      window.xchild = {
        props: component.xprops,
        close: noop,
      };
    }

    return component;
  });
}
