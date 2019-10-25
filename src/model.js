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