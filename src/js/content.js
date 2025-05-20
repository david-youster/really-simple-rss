/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

const Content = {

  async handleMessage(message) {
    if (message === 'discover') {
      const feeds = Content.discoverFeeds();
      return feeds;
    }
  },


  discoverFeeds() {
    let feeds = [];
    feeds.push(...Content._findFeedLinks());
    return feeds;
  },

  _findFeedLinks() {
    const feeds = [];
    for (let link of document.getElementsByTagName('link')) {
      if (Content._isFeed(link)) {
        // Ideally, this should use the model Feed object.
        // Since it's been converted to a module, it's no longer available here.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1451545
        feeds.push({
          title: link.title !== '' ? link.title : link.href,
          href: link.href
        });
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