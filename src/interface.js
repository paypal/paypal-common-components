/* @flow */

import { isPayPalDomain } from '@paypal/sdk-client/src';
// eslint-disable-next-line import/no-namespace
import * as postRobotModule from 'post-robot/src';

import { getThreeDomainSecureComponent } from './three-domain-secure';

function protectedExport<T>(xport : T) : ?T {
    if (isPayPalDomain()) {
        return xport;
    }
}

export const ThreeDomainSecure = {
    // $FlowFixMe
    __get__: () => protectedExport(getThreeDomainSecureComponent())
};

export const postRobot = {
    // $FlowFixMe
    __get__: () => protectedExport(postRobotModule)
};
