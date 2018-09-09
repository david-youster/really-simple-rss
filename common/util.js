/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* exported Util */

'use strict';

const Util = {};

Util.parseXmlFromResponseText = function(responseText) {
  return new Promise(function(resolve) {
    resolve(new window.DOMParser().parseFromString(responseText, 'text/xml'));
  });

};

Util.clearNodeContent = function(node) {
  while (node.hasChildNodes()) {
    node.removeChild(node.firstChild);
  }
};

Util.populateList = function(listNode, collection, onBuildNode) {
  let fragment = document.createDocumentFragment();
  for (let item of collection) {
    fragment.appendChild(onBuildNode(item));
  }
  Util.clearNodeContent(listNode);
  listNode.appendChild(fragment);
};