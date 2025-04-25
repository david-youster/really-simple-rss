/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* exported Bookmark, FeedItem, Feed */

'use strict';

function Bookmark(wxBookmark) {
  this.parentId = wxBookmark.parentId;
  this.id = wxBookmark.id;
  this.title = wxBookmark.title ? wxBookmark.title : wxBookmark.url;
  this.url = wxBookmark.url;
  this.index = wxBookmark.index ? wxBookmark.index : 0;
}

function FeedItem(title, link, description) {
  this.title = title ? title : link;
  this.link = link;
  this.description = description ? description : 'No description available';
}

function Feed(title, href) {
  this.title = title;
  this.href = href;
}