/* @flow */
/* eslint import/unambiguous: 0 */

import { FUNDING } from "@paypal/sdk-constants/src";

declare var __PAYPAL_CHECKOUT__: {|
  __REMEMBERED_FUNDING__: Array<$Values<typeof FUNDING>>, // eslint-disable-line flowtype/no-mutable-array
|};
