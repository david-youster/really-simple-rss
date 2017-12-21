/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'discover') {
    return Promise.resolve(discoverFeeds());
  }
});

function discoverFeeds() {
  let feeds = [];
  for (let link of document.getElementsByTagName('link')) {
    if (isFeed(link)) {
      feeds.push({href: link.href, title: link.title});
    }
  }
  return feeds;
}

function isFeed(link) {
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
