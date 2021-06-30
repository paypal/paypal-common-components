/* @flow */
/** @jsx node */

const result = window.xprops.getParent().contingencyResult || { success: true };
window.xprops.onContingencyResult(null, result);
