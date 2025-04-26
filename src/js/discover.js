/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* global Formatting, Storage, Bookmarks, Settings */

'use strict';

import { Formatting } from "./formatting.js";
import { Bookmarks } from "./service/bookmarks.js";
import { Storage } from "./service/storage.js";
import { Settings } from "./service/settings.js";

const DiscoveredFeedsPage = {

  init() {
    this._initPage();
  },


  async _initPage() {
    await this._applyTheme();
    const feeds = await Storage.loadPanelData('/html/discover.html');
    await Storage.clearPanelData('/html/discover.html');
    const discoveredFeedsList = document.getElementById(
      'discovered-feeds-list');
    if (feeds.length === 0) {
      discoveredFeedsList.innerHTML = 'No feeds detected.';
      return;
    }
    feeds.forEach(feed => discoveredFeedsList.appendChild(
      this._createListNodeFromFeed(feed)));
  },

  async _applyTheme() {
    const link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = `/css/${await Settings.getTheme()}.css`;
    document.head.appendChild(link);
  },

  _createListNodeFromFeed(feed) {
    return Formatting.DiscoveredFeeds.Feed.convertToNode(feed,
      () => Bookmarks.createBookmark(feed, true));
  }

};

window.onload = () => DiscoveredFeedsPage.init();