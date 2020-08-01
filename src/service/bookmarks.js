/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

function BookmarkService(webexService) {
  this._initServices(webexService);
}

BookmarkService.prototype._initServices = function(webexService) {
  this.webex = webexService;
};

BookmarkService.prototype.getFeedBookmarks = async function() {
  const bookmarks = await this.webex.getBookmarks('Simple Feeds');
  return bookmarks;
};

BookmarkService.prototype.deleteBookmark = async function(bookmark) {
  await this.webex.removeBookmark(bookmark.id);
};

BookmarkService.prototype._saveLastDeleted = async function(bookmark) {
  this.lastDeleted = bookmark;
};

BookmarkService.prototype.undoDelete = async function(bookmark) {
  const createdBookmark = await this.webex.createBookmark(bookmark);
  return createdBookmark;
};

// TODO refactor to use messaging service
BookmarkService.prototype.createBookmark = async function(
  feed, sendRefreshNotification) {

  this.webex.createBookmark(
    { title: feed.title, url: feed.href, index: 0 },
    'Simple Feeds');

  if (sendRefreshNotification) {
    this.webex.sendMessage('refresh');
  }
};