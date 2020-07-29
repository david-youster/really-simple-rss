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