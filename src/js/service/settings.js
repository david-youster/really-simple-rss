/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as wx from './webex.js';


export async function init() {
  const settings = await wx.load('settings');
  const v2Settings = {
    schema: '2.0.0',
    theme: 'default',
    swapDisplays: false
  };

  // If existing install is version 1.x, migrate existing settings schema
  if (settings && settings.schema !== '2.0.0') {
    v2Settings.theme = settings.darkTheme ? 'dark' : 'default';
    v2Settings.swapDisplays = settings.swapDisplays ? true : false;
  } else if (settings && settings.schema === '2.0.0') {
    v2Settings.theme = settings.theme;
    v2Settings.swapDisplays = settings.swapDisplays;
  }

  await wx.save('settings', v2Settings);
};

export async function getTheme() {
  const settings = await wx.load('settings');
  return settings && settings.theme ? settings.theme : 'default';
};

export async function setTheme(theme) {
  if (['default', 'dark'].indexOf(theme) < 0) {
    throw 'Invalid theme requested';
  }
  const settings = await wx.load('settings');
  settings.theme = theme;
  await wx.save('settings', settings);
};

export async function isSwapDisplaysEnabled() {
  const settings = await wx.load('settings');
  return settings && settings.swapDisplays ?
    settings.swapDisplays : false;
};

export async function setSwapDisplays(swapDisplays) {
  const settings = await wx.load('settings');
  settings.swapDisplays = swapDisplays;
  await wx.save('settings', settings);
};
