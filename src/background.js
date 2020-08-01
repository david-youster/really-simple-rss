/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* global WebExtensions */

'use strict';

const Background = {

  init(webexService) {
    this._initServices(webexService);
    this._initBookmarks();
    this._initBrowserAction();
  },

  _initServices(webexService) {
    this.webex = webexService;
  },

  _initBookmarks() {
    this.webex.initBookmarks('Simple Feeds');
  },

  _initBrowserAction() {
    this.webex.setBrowserAction(this.webex.openSidebar);
  }

};

Background.init(new WebExtensions());