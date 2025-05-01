/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as wx from './webex.js';

export async function init() {
  wx.addMenuShownListener(_onShown);
  wx.addMenuItemClickListener(_onClicked);
  wx.addMenuHiddenListener(_onHidden);
};

function _onShown(info) {
  if (info.targetElementId === undefined) {
    return;
  }
  const element = wx.getTargetElement(info.targetElementId);
  if (element.classList.contains('feed-title-container')
        && element.dataset.homepage !== undefined) {
    const url = element.dataset.homepage;
    wx.addMenuItem('goto-feed-homepage' + url, `Go to ${url}`);
  }
};

async function _onHidden() {
  await wx.removeAllMenuItems();
};

async function _onClicked(info) {
  if (info.targetElementId === undefined) {
    return;
  }
  const element = wx.getTargetElement(info.targetElementId);
  if (element.classList.contains('feed-title-container')
        && element.dataset.homepage !== undefined) {
    const url = element.dataset.homepage;
    await wx.newTab(url, true);
  }
};
