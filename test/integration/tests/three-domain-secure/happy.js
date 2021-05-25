/* @flow */
/* eslint max-lines: 0 */

import { wrapPromise } from 'belter/src';

describe(`paypal 3ds component happy path`, () => {

    it('should render the 3ds component', () => {
        return wrapPromise(({ expect, avoid }) => {
            const nonce = '12345';
            return window.paypal.ThreeDomainSecure({
                createOrder: () => 'XXXXXXXXXXXXXXXXX',
                onSuccess:   expect('onSuccess'),
                onCancel:    avoid('onCancel'),
                onError:     avoid('onError'),
                nonce

            }).render('body');
        });
    });
});
