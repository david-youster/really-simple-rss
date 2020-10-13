/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* global Feed */

'use strict';

const Content = {

  handleMessage(message) {
    if (message === 'discover') {
      const feeds = Content.discoverFeeds();
      return Promise.resolve(feeds); //TODO replace with async function
    }
  },


  discoverFeeds() {
    let feeds = [];
    for (let link of document.getElementsByTagName('link')) {
      if (Content._isFeed(link)) {
        feeds.push(new Feed(link.title, link.href));
      }
    }
    return feeds;
  },

  _isFeed(link) {
    let feedContentTypes = [
      'application/rss',
      'application/atom',
      'application/rss+xml',
      'application/atom+xml',
      'text/rss',
      'text/atom'
    ];

    let xmlContentTypes = [
      'application/xml',
      'text/xml'
    ];

    return feedContentTypes.indexOf(link.type) >= 0 ||
      (link.rel === 'alternate' && xmlContentTypes.indexOf(link.type) >= 0);

  }
};

browser.runtime.onMessage.addListener(Content.handleMessage);