/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

function StorageService(webexService) {
  this.webex = webexService;
}

StorageService.prototype.loadPanelData = async function(key) {
  const panelData = await this.webex.load('panelData');
  return panelData[key];
};

StorageService.prototype.clearPanelData = async function(key) {
  const panelData = await this.webex.load('panelData');
  delete panelData[key];
  await this.webex.save(panelData);
};