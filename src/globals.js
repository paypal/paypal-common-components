/* @flow */

import { FUNDING } from "@paypal/sdk-constants/src";

// eslint-disable-next-line flowtype/no-mutable-array
export function getRememberedFunding(): Array<$Values<typeof FUNDING>> {
  return __PAYPAL_CHECKOUT__.__REMEMBERED_FUNDING__;
}
