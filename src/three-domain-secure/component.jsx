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
          value: () => "verify",
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
        },
        clientID: {
          type: "string",
          value: getClientID,
          queryParam: true,
        },
        onSuccess: {
          type: "function",
          alias: "onContingencyResult",
          decorate: ({ value, onError }) => {
            return (err, result) => {
              if (err || (result && !result.success)) {
                return onError(err);
              }

              return value(true);
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
