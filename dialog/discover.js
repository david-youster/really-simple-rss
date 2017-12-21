'use strict';

function forceRedraw() {
  browser.windows.getCurrent().then((window) => {
    browser.windows.update(window.id, {height: window.height + 1});
  });
}

window.onload = () => {

  browser.tabs.query({active: true}).then((tabs) => {

    browser.tabs.sendMessage(tabs[0].id, {action: 'discover'}).then((feeds) => {

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

      document.getElementById('discovered-feeds').appendChild(fragment);
      forceRedraw();
    });
  });
};