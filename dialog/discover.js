/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global Util */

'use strict';

window.onload = onWindowLoaded;

function onWindowLoaded() {
  browser.storage.local.get('feeds').then(onDiscoveredFeedsLoaded);
}

function onDiscoveredFeedsLoaded(feeds) {
  if (feeds.feeds.length === 0) {
    forceRedraw();
    return;
  }

  let fragment = document.createDocumentFragment();
  for (let feed of feeds.feeds) {
    let listNode = document.createElement('li');
    listNode.appendChild(
      document.createTextNode(feed.title ? feed.title : feed.href));
    listNode.onclick = () => onFeedTitleListNodeClicked(feed);
    fragment.appendChild(listNode);
  }
  let discoveredFeeds = document.getElementById('discovered-feeds');
  Util.clearNodeContent(discoveredFeeds);
  discoveredFeeds.appendChild(fragment);
  forceRedraw();
}

function onFeedTitleListNodeClicked(feed) {
  browser.bookmarks.search('Simple Feeds')
    .then(bookmarks => onFeedsFolderFound(bookmarks, feed));
}

function onFeedsFolderFound(bookmarks, feed) {
  const newBookmark = {
    index: 0,
    parentId: bookmarks[0].id,
    title: feed.title,
    url: feed.href
  };
  browser.bookmarks.create(newBookmark)
    .then(() => browser.runtime.sendMessage({action: 'refresh'}));
}

function forceRedraw() {
  browser.windows.getCurrent().then((window) => {
    browser.windows.update(window.id, {height: window.height + 1});
  });
}
