/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* global WebExtensions */

'use strict';

const Messaging = {
  webex: WebExtensions
};

Messaging.addListener = function (onMessageReceived) {
  this.webex.addListener(onMessageReceived);
};

Messaging.requestRefresh = function () {
  this.webex.sendMessage('refresh');
};

Messaging.requestApplyTheme = function () {
  this.webex.sendMessage('theme');
};

Messaging.requestSwapDisplays = function () {
  this.webex.sendMessage('swap');
};

