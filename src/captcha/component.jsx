/* @flow */
/** @jsx node */
/* eslint max-lines: 0 */

import { node, dom } from "@krakenjs/jsx-pragmatic/src";
import { create, type ZoidComponent } from "@krakenjs/zoid/src";
import { inlineMemoize, noop } from "@krakenjs/belter/src";
import { getSDKMeta, getClientID, getCSPNonce } from "@paypal/sdk-client/src";
import { ZalgoPromise } from "@krakenjs/zalgo-promise/src";

import { Overlay } from "../overlay";
import { getCaptchaUrl } from "../config";

export type CaptchaResult = {||};

export const USER_TYPE = {
  BRANDED_GUEST: ("BRANDED_GUEST": "BRANDED_GUEST"), // inline guest flow
  UNBRANDED_GUEST: ("UNBRANDED_GUEST": "UNBRANDED_GUEST"), // UCC
  MEMBER: ("MEMBER": "MEMBER"),
};

export type CaptchaProps = {|
  action: string,
  xcomponent: string,
  flow: string,
  orderID: string,
  onSuccess: (CaptchaResult) => void,
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

export type CaptchaComponent = ZoidComponent<CaptchaProps>;

export function getCaptchaComponent(): CaptchaComponent {
  // eslint-disable-next-line no-console
  console.log("CAPTCHA iframe URL:", getCaptchaUrl);

  return inlineMemoize(getCaptchaComponent, () => {
    const component = create({
      tag: "captcha",
      url: getCaptchaUrl,

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
        // eslint-disable-next-line no-console
        console.log("Container template initialized");
        // eslint-disable-next-line no-console
        console.log("Event object:", event);
        // eslint-disable-next-line no-console
        console.log("Doc object:", doc);

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
          value: (data) => (data.props.action ? data.props.action : "rca"),
        },
        xcomponent: {
          type: "string",
          queryParam: true,
          value: () => "1",
        },
        flow: {
          type: "string",
          queryParam: true,
          value: () => "rca",
        },
        createOrder: {
          type: "function",
          queryParam: "cart_id",
          // $FlowFixMe[incompatible-call]
          queryValue: ({ value }) => ZalgoPromise.try(value),
          required: false,
        },
        token: {
          type: "string",
          queryParam: "token",
          queryValue: ({ value }) => value,
          required: false,
        },
        clientID: {
          type: "string",
          value: getClientID,
          queryParam: true,
        },
        onError: {
          type: "function",
          required: false,
        },
        onSuccess: {
          type: "function",
          alias: "onContingencyResult",
          decorate: ({ props, value, onError }) => {
            return (err, result) => {
              const isCardFieldFlow = props?.userType === "UNBRANDED_GUEST";

              const hasError = isCardFieldFlow
                ? Boolean(err)
                : // $FlowFixMe[incompatible-use]
                  Boolean(err) || result?.success === false;

              if (hasError) {
                if (onError) {
                  return onError(
                    err || new Error("CAPTCHA verification failed")
                  );
                }
                return;
              }

              return value(result);
            };
          },
        },
        onCancel: {
          type: "function",
          required: false,
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
        integrationType: {
          type: "string",
          required: false,
          queryParam: true,
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
