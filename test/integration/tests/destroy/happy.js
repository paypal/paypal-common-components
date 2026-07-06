/* @flow */
/* eslint max-lines: 0 */

import { create } from "@krakenjs/zoid/src";

import { destroy } from "../../../../src/interface";

describe("destroy export", () => {
  it("should export a destroy function", () => {
    if (typeof destroy !== "function") {
      throw new TypeError("Expected destroy to be a function");
    }
  });

  it("should not throw when called multiple times", () => {
    destroy();
    destroy();
  });

  it("should accept an error argument", () => {
    destroy(new Error("test destroy"));
  });

  it("should clean up zoid listeners so a component with the same tag can be re-created after destroy", () => {
    const tag = "three-domain-secure-double-load-test";
    const url = () => "about:blank";

    create({
      tag,
      url,
      attributes: { iframe: { scrolling: "no" } },
    });

    destroy();

    create({
      tag,
      url,
      attributes: { iframe: { scrolling: "no" } },
    });
  });
});
