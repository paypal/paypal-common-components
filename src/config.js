/* @flow */

import { getPayPalDomain } from "@paypal/sdk-client/src";

const URI = __TEST__
  ? {
      THREEDOMAINSECURE: `/base/test/integration/windows/helios/index.htm`,
    }
  : {
      THREEDOMAINSECURE: `/webapps/helios`,
    };

export function getThreeDomainSecureUrl(): string {
  return `${getPayPalDomain()}${URI.THREEDOMAINSECURE}`;
}
