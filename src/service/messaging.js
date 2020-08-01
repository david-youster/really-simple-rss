/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

function MessagingService(webexService) {
  this.webex = webexService;
}

MessagingService.prototype.addListener = function(onMessageReceived) {
  this.webex.addListener(onMessageReceived);
};

MessagingService.prototype.requestRefresh = function() {
  this.webex.sendMessage('refresh');
};

