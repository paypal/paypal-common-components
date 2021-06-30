/* @flow */
/** @jsx node */

const result = (window.xprops && window.xprops.getParent() && window.xprops.getParent().contingencyResult) || { success: true };
console.log(`RESULT: ${ JSON.stringify(result) }`);
window.xprops.onContingencyResult(null, result);
