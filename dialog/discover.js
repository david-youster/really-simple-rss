/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

function forceRedraw() {
  browser.windows.getCurrent().then((window) => {
    browser.windows.update(window.id, {height: window.height + 1});
  });
}

window.onload = () => {

  browser.tabs.query({active: true}).then((tabs) => {

    browser.tabs.sendMessage(tabs[0].id, {action: 'discover'}).then((feeds) => {

      if (feeds.length === 0) {
        forceRedraw();
        return;
      }

      let fragment = document.createDocumentFragment();
      for (let feed of feeds) {
        let listNode = document.createElement('li');
        listNode.appendChild(
          document.createTextNode(feed.title ? feed.title : feed.href));

        listNode.onclick = () => {
          browser.bookmarks.search('Simple Feeds')
            .then((bookmarks) => {
              browser.bookmarks.create({
                index: 0,
                parentId: bookmarks[0].id,
                title: feed.title,
                url: feed.href
              }).then(() => {
                browser.runtime.sendMessage({action: 'refresh'});
              });
            });
        };
        fragment.appendChild(listNode);
      }
      let discoveredFeeds = document.getElementById('discovered-feeds');
      clearNodeContent(discoveredFeeds);
      discoveredFeeds.appendChild(fragment);
      forceRedraw();
    });
  });
};