/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as Settings from './service/settings.js';
import * as Messaging from './service/messaging.js';

const SettingsPage = {

  async init() {
    const darkThemeRadio = document.getElementById('darkThemeRadio');
    const defaultThemeRadio = document.getElementById('defaultThemeRadio');
    const highlightErrorsCheckbox =
      document.getElementById('highlightFeedErrorsCheckbox');

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

    highlightErrorsCheckbox.onclick = async ({target}) => {
      await Settings.setHighlightFeedErrors(target.checked);
      // TODO send update message to sidebar
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

    const highlightFeedErrors = await Settings.isFeedErrorHighlightingEnabled();
    highlightErrorsCheckbox.checked = highlightFeedErrors;
  }
};

window.onload = () => SettingsPage.init();