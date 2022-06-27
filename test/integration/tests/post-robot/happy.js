/* @flow */
/* eslint max-lines: 0 */

describe(`paypal post robot happy path`, () => {
  it("should export post robot", () => {
    if (!window.paypal.postRobot) {
      throw new Error(`Expected paypal.postRobot to be exported`);
    }

    if (!window.paypal.postRobot.on || !window.paypal.postRobot.send) {
      throw new Error(`Expected paypal.postRobot to have on and send methods`);
    }
  });
});
