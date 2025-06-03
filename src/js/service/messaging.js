/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as wx from './webex.js';

export function addListener(onMessageReceived) {
  wx.addListener(onMessageReceived);
};

export function requestRefresh () {
  wx.sendMessage('refresh');
};

export function requestApplyTheme () {
  wx.sendMessage('theme');
};

export function requestSwapDisplays () {
  wx.sendMessage('swap');
};

export function requestApplyErrorHighlights() {
  wx.sendMessage('highlight');
}
