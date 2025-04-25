/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* global WebExtensions */


'use strict';

const Settings = {
  webex: WebExtensions
};

Settings._initSettings = async function () {
  const settings = await this.webex.load('settings');
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

  await this.webex.save('settings', v2Settings);
};

Settings.getTheme = async function () {
  const settings = await this.webex.load('settings');
  return settings && settings.theme ? settings.theme : 'default';
};

Settings.setTheme = async function (theme) {
  if (['default', 'dark'].indexOf(theme) < 0) {
    throw 'Invalid theme requested';
  }
  const settings = await this.webex.load('settings');
  settings.theme = theme;
  await this.webex.save('settings', settings);
};

Settings.isSwapDisplaysEnabled = async function () {
  const settings = await this.webex.load('settings');
  return settings && settings.swapDisplays ?
    settings.swapDisplays : false;
};

Settings.setSwapDisplays = async function (swapDisplays) {
  const settings = await this.webex.load('settings');
  settings.swapDisplays = swapDisplays;
  await this.webex.save('settings', settings);
};

