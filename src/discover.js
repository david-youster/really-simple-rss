/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* global Formatting,WebExtensions, StorageService,
          BookmarkService, SettingsService
*/

'use strict';

const DiscoveredFeeds = {

  init(storageService, bookmarkService, settingsService) {
    this._initServices(storageService, bookmarkService, settingsService);
    this._initPage();
  },

  _initServices(storageService, bookmarkService, settingsService) {
    this.storageService = storageService;
    this.bookmarkService = bookmarkService;
    this.settingsService = settingsService;
  },


  async _initPage() {
    this._applyTheme();
    const feeds = await this.storageService.loadPanelData('discover.html');
    this.storageService.clearPanelData('discover.html');
    const discoveredFeedsList = document.getElementById(
      'discovered-feeds-list');
    if (feeds.length === 0) {
      discoveredFeedsList.innerHTML = 'No feeds detected.';
      return;
    }
    feeds.forEach(feed => discoveredFeedsList.appendChild(
      this._createListNodeFromFeed(feed, this.bookmarkService)));
  },

  async _applyTheme() {
    const link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = await this.settingsService.getTheme() + '.css';
    document.head.appendChild(link);
  },

  _createListNodeFromFeed(feed, bookmarkService) {
    return Formatting.DiscoveredFeeds.Feed.convertToNode(feed,
      () => bookmarkService.createBookmark(feed, true));
  }

};

const webexService = new WebExtensions();
const storageService = new StorageService(webexService);
const bookmarkService = new BookmarkService(webexService);
const settingsService = new SettingsService(webexService);
window.onload = () => DiscoveredFeeds.init(
  storageService,
  bookmarkService,
  settingsService);