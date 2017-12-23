/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/* exported Util */
const Util = {};

Util.clearNodeContent = function(node) {
  while (node.hasChildNodes()) {
    node.removeChild(node.firstChild);
  }
};