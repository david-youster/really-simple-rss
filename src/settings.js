/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* global WebExtensions, SettingsService, MessagingService */

'use strict';

const Settings = {

  init(settingsService, messagingService) {
    this._initServices(settingsService, messagingService);
    this._initPage();
  },

  _initServices(settingsService, messagingService) {
    this.settingsService = settingsService;
    this.messagingService = messagingService;
  },

  async _initPage() {
    const darkThemeRadio = document.getElementById('darkThemeRadio');
    const defaultThemeRadio = document.getElementById('defaultThemeRadio');

    darkThemeRadio.onclick = async () => {
      await this.settingsService.setTheme('dark');
      this.messagingService.requestApplyTheme();
    };
    defaultThemeRadio.onclick = async () => {
      await this.settingsService.setTheme('default');
      this.messagingService.requestApplyTheme();
    };

    const swapDisplaysDisabledRadio = document.getElementById(
      'swapDisplaysDisabledRadio');
    const swapDisplaysEnabledRadio = document.getElementById(
      'swapDisplaysEnabledRadio');

    swapDisplaysDisabledRadio.onclick = async () => {
      await this.settingsService.setSwapDisplays(false);
      this.messagingService.requestSwapDisplays();
    };
    swapDisplaysEnabledRadio.onclick = async () => {
      await this.settingsService.setSwapDisplays(true);
      this.messagingService.requestSwapDisplays();
    };

    const theme = await this.settingsService.getTheme();
    if (theme === 'dark') {
      darkThemeRadio.checked = true;
    } else {
      defaultThemeRadio.checked = true;
    }

    const swapDisplays = await this.settingsService.isSwapDisplaysEnabled();
    if (swapDisplays) {
      swapDisplaysEnabledRadio.checked = true;
    } else {
      swapDisplaysDisabledRadio.checked = true;
    }
  }
};

const webex = new WebExtensions();
const settingsService = new SettingsService(webex);
const messagingService = new MessagingService(webex);
window.onload = () => Settings.init(settingsService, messagingService);