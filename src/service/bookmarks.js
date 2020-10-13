/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* global WebExtensions */

'use strict';
const Bookmarks = {
  webex: WebExtensions
};

Bookmarks._initServices = function(webexService) {
  this.webex = webexService;
};

Bookmarks.getFeedBookmarks = async function() {
  const bookmarks = await this.webex.getBookmarks('Simple Feeds');
  return bookmarks;
};

Bookmarks.deleteBookmark = async function(bookmark) {
  await this.webex.removeBookmark(bookmark.id);
};

Bookmarks._saveLastDeleted = async function(bookmark) {
  this.lastDeleted = bookmark;
};

Bookmarks.undoDelete = async function(bookmark) {
  const createdBookmark = await this.webex.createBookmark(bookmark);
  return createdBookmark;
};

// TODO refactor to use messaging service
Bookmarks.createBookmark = async function(
  feed, sendRefreshNotification) {

  await this.webex.createBookmark(
    { title: feed.title, url: feed.href, index: 0 },
    'Simple Feeds');

  if (sendRefreshNotification) {
    this.webex.sendMessage('bookmark-added');
  }
};