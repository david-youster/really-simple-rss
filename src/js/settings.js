/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* global Settings, Messaging */

'use strict';

import { Settings } from "./service/settings.js";
import { Messaging } from "./service/messaging.js";

const SettingsPage = {

  init() {
    this._initPage();
  },

  async _initPage() {
    const darkThemeRadio = document.getElementById('darkThemeRadio');
    const defaultThemeRadio = document.getElementById('defaultThemeRadio');

    darkThemeRadio.onclick = async () => {
      await Settings.setTheme('dark');
      Messaging.requestApplyTheme();
    };
    defaultThemeRadio.onclick = async () => {
      await Settings.setTheme('default');
      Messaging.requestApplyTheme();
    };

    const swapDisplaysDisabledRadio = document.getElementById(
      'swapDisplaysDisabledRadio');
    const swapDisplaysEnabledRadio = document.getElementById(
      'swapDisplaysEnabledRadio');

    swapDisplaysDisabledRadio.onclick = async () => {
      await Settings.setSwapDisplays(false);
      Messaging.requestSwapDisplays();
    };
    swapDisplaysEnabledRadio.onclick = async () => {
      await Settings.setSwapDisplays(true);
      Messaging.requestSwapDisplays();
    };

    const theme = await Settings.getTheme();
    if (theme === 'dark') {
      darkThemeRadio.checked = true;
    } else {
      defaultThemeRadio.checked = true;
    }

    const swapDisplays = await Settings.isSwapDisplaysEnabled();
    if (swapDisplays) {
      swapDisplaysEnabledRadio.checked = true;
    } else {
      swapDisplaysDisabledRadio.checked = true;
    }
  }
};

window.onload = () => SettingsPage.init();