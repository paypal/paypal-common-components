/* @flow */

import type { FundingEligibilityType } from '@paypal/sdk-client/src';
import { FUNDING } from '@paypal/sdk-constants/src';

export function getFundingEligibility() : FundingEligibilityType {
    return __paypal_checkout__.serverConfig.fundingEligibility;
}

export function getRememberedFunding() : Array<$Values<typeof FUNDING>> { // eslint-disable-line flowtype/no-mutable-array
    return __PAYPAL_CHECKOUT__.__REMEMBERED_FUNDING__;
}
