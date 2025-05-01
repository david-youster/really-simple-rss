/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as wx from './webex.js';

export async function getFeedBookmarks() {
  const bookmarks = await wx.getBookmarks('Simple Feeds');
  return bookmarks;
};

export async function deleteBookmark (bookmark) {
  await wx.removeBookmark(bookmark.id);
};

export async function undoDelete (bookmark) {
  const createdBookmark = await wx.createBookmark(bookmark);
  return createdBookmark;
};

// TODO refactor to use messaging service
export async function createBookmark(
  feed, sendRefreshNotification) {

  await wx.createBookmark(
    { title: feed.title, url: feed.href, index: 0 },
    'Simple Feeds');

  if (sendRefreshNotification) {
    wx.sendMessage('bookmark-added');
  }
};
