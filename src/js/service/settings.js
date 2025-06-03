/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as wx from './webex.js';


export async function init() {
  const settings = await wx.load('settings');
  const v2Settings = {
    schema: '2.1.0',
    theme: 'default',
    swapDisplays: false,
    highlightFeedErrors: true,
  };

  // Only use the newer setting if it's available, disregarding the old
  // 'darkTheme' setting
  v2Settings.theme = (settings.theme !== undefined && settings.theme !== null)
    ? settings.theme
    : v2Settings.theme;

  v2Settings.swapDisplays =(settings.swapDisplays !== undefined
      && settings.swapDisplays !== null)
    ? settings.swapDisplays
    : v2Settings.swapDisplay;

  v2Settings.highlightFeedErrors = (settings.highlightFeedErrors !== undefined
      && settings.highlightFeedErrors !== null)
    ? settings.highlightFeedErrors
    : v2Settings.highlightFeedErrors;

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

export async function isFeedErrorHighlightingEnabled() {
  const settings = await wx.load('settings');
  return settings && settings.highlightFeedErrors !== undefined ?
    settings.highlightFeedErrors : true;
};

export async function setHighlightFeedErrors(enabled) {
  const settings = await wx.load('settings');
  settings.highlightFeedErrors = enabled;
  await wx.save('settings', settings);
};