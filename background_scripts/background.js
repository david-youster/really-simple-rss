'use strict';

browser.bookmarks.search('Simple Feeds').then((bookmarks) => {
  if (bookmarks.length === 0) {
    browser.bookmarks.create({title: 'Simple Feeds', type: 'folder'});
  }
}).then(() => {
  browser.browserAction.onClicked.addListener(() => {
    browser.sidebarAction.open();
  });
});
