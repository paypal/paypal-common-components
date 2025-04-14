/* @flow */

import { isPayPalDomain, getEnv } from "@paypal/sdk-client/src";
// eslint-disable-next-line import/no-namespace
import * as postRobotModule from "@krakenjs/post-robot/src";
import { ENV } from "@paypal/sdk-constants/src";

import {
  getThreeDomainSecureComponent,
  type TDSComponent,
} from "./three-domain-secure";

export type LazyExport<T> = {|
  __get__: () => T,
|};

export type LazyProtectedExport<T> = {|
  __get__: () => ?T,
|};

function protectedExport<T>(xport: T): ?T {
  if (isPayPalDomain()) {
    return xport;
  }
}

// $FlowIssue
export const devEnvOnlyExport = (unprotectedExport) => {
  const env = getEnv();
  if (env === ENV.LOCAL || env === ENV.STAGE || env === ENV.TEST) {
    return unprotectedExport;
  } else {
    return undefined;
  }
};

export const ThreeDomainSecure: LazyProtectedExport<TDSComponent> = {
  __get__: () => devEnvOnlyExport(getThreeDomainSecureComponent()),
};

export const postRobot: LazyProtectedExport<typeof postRobotModule> = {
  __get__: () => protectedExport(postRobotModule),
};
