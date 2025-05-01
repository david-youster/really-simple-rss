/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as wx from './service/webex.js';
import * as Settings from './service/settings.js';

function init() {
  initBookmarks();
  initBrowserAction();
  initSettings();
}

async function initSettings() {
  await Settings.init();
}

function initBookmarks() {
  wx.initBookmarks('Simple Feeds');
}

function  initBrowserAction() {
  wx.setBrowserAction(this.webex.openSidebar);
}


init();
