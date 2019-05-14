/* @flow */

import { isPayPalDomain } from '@paypal/sdk-client/src';

import { getThreeDomainSecureComponent } from './three-domain-secure';

function protectedExport<T>(xport : T) : ?T {
    if (isPayPalDomain()) {
        return xport;
    }
}

export const ThreeDomainSecure = {
    __get__: () => protectedExport(getThreeDomainSecureComponent())
};
