/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

browser.bookmarks.search('Simple Feeds')
  .then(createBookmarksFolder)
  .then(setBrowserAction);

function createBookmarksFolder(bookmarks) {
  if (bookmarks.length === 0) {
    browser.bookmarks.create({title: 'Simple Feeds', type: 'folder'});
  }
}

function setBrowserAction() {
  browser.browserAction.onClicked.addListener(
    () => browser.sidebarAction.open());
}

browser.windows.onRemoved.addListener(
  () => browser.storage.local.remove('deleteId'));
