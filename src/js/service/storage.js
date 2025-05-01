/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as wx from './webex.js';

export async function loadPanelData (key) {
  const panelData = await wx.load('panelData');
  return panelData[key];
};

export async  function clearPanelData (key) {
  const panelData = await wx.load('panelData');
  delete panelData[key];
  await wx.save(panelData);
};
