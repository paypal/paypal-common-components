/* @flow */

import { FUNDING } from '@paypal/sdk-constants/src';

export function getRememberedFunding() : Array<$Values<typeof FUNDING>> { // eslint-disable-line flowtype/no-mutable-array
    return __PAYPAL_CHECKOUT__.__REMEMBERED_FUNDING__;
}
