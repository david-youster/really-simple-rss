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

    darkThemeRadio.onclick = () => {
      this.settingsService.setTheme('dark');
      this.messagingService.requestRefresh();
    };
    defaultThemeRadio.onclick = () => {
      this.settingsService.setTheme('default');
      this.messagingService.requestRefresh();
    };

    const swapDisplaysDisabledRadio = document.getElementById(
      'swapDisplaysDisabledRadio');
    const swapDisplaysEnabledRadio = document.getElementById(
      'swapDisplaysEnabledRadio');

    swapDisplaysDisabledRadio.onclick = () => {
      this.settingsService.setSwapDisplays(false);
      this.messagingService.requestRefresh();
    };
    swapDisplaysEnabledRadio.onclick = () => {
      this.settingsService.setSwapDisplays(true);
      this.messagingService.requestRefresh();
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