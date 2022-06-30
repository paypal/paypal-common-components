/* @flow */

import { isPayPalDomain } from "@paypal/sdk-client/src";
// eslint-disable-next-line import/no-namespace
import * as postRobotModule from "@krakenjs/post-robot/src";

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

export const ThreeDomainSecure: LazyProtectedExport<TDSComponent> = {
  __get__: () => protectedExport(getThreeDomainSecureComponent()),
};

export const postRobot: LazyProtectedExport<typeof postRobotModule> = {
  __get__: () => protectedExport(postRobotModule),
};
