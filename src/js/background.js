/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* global Settings, WebExtensions */

'use strict';

import { WebExtensions } from "./service/webex.js";

const BackgroundPage = {

  webex: WebExtensions,

  init() {
    this._initBookmarks();
    this._initBrowserAction();
  },

  async _initServices(webexService) {
    this.webex = webexService;
    await Settings._initSettings();
  },

  _initBookmarks() {
    this.webex.initBookmarks('Simple Feeds');
  },

  _initBrowserAction() {
    this.webex.setBrowserAction(this.webex.openSidebar);
  }

};

BackgroundPage.init();
