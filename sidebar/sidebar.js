'use strict';

function init() {
  initSidebar();
  initControls();
  initListeners();
}

function initSidebar() {
  browser.bookmarks.search('Simple Feeds').then((bookmarks) => {

    browser.bookmarks.getSubTree(bookmarks[0].id).then((bookmarkItems) => {
      let fragment = document.createDocumentFragment();
      for (let bookmark of bookmarkItems[0].children) {
        fragment.appendChild(createBookmarkListNode(bookmark));
      }
      let feedsList = document.getElementById('feeds-list');
      feedsList.innerHTML = '';
      feedsList.appendChild(fragment);
    });
  });
}

function initControls() {
  document.getElementById('discover-button').onclick = () => {
    browser.windows.create({
      url: browser.extension.getURL('dialog/discover.html'),
      type: 'popup',
      width: 500,
      height: 200
    });
  };
}

function initListeners() {
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'refresh') {
      initSidebar();
    }
  });
}

function createBookmarkListNode(bookmark) {
  let listNode = document.createElement('li');
  listNode.appendChild(createListNodeTextSection(bookmark));
  listNode.appendChild(createListNodeControlSection(bookmark));
  return listNode;
}

function createListNodeTextSection(bookmark) {
  let titleContainer = document.createElement('div');
  titleContainer.classList.add('feed-title-container');
  titleContainer.appendChild(
    document.createTextNode(bookmark.title ? bookmark.title : bookmark.url));
  titleContainer.onclick = () => parseAndDisplayFeed(bookmark.url);
  return titleContainer;
}

function createListNodeControlSection(bookmark) {
  let controlContainer = document.createElement('div');
  controlContainer.classList.add('feed-control-container');
  let deleteButton = document.createElement('input');
  deleteButton.type = 'image';
  deleteButton.src = '/icons/delete.svg';
  deleteButton.style.height = "15px";
  deleteButton.onclick = () => {
    browser.bookmarks.remove(bookmark.id).then(() => initSidebar());
  };
  controlContainer.appendChild(deleteButton);
  return controlContainer;
}

function parseAndDisplayFeed(url) {
  let requestData = {method: 'GET', mode: 'cors'};
  fetch(url, requestData)
    .then(response => response.text())
    .then(responseText =>
      (new window.DOMParser()).parseFromString(responseText, 'text/xml'))
    .then(xmlData => {
      let parserFunction = selectFeedParser(xmlData);
      let fragment = document.createDocumentFragment();

      for (let listNode of parserFunction(xmlData)) {
        fragment.appendChild(listNode);
      }

      let feedItems = document.getElementById('feed-items');
      feedItems.innerHTML = '';
      feedItems.append(fragment);
    });
}

function selectFeedParser(xmlData) {
  if (xmlData.getElementsByTagName('rss').length > 0) {
    return parseRss;
  }

  if (xmlData.getElementsByTagName('feed').length > 0) {
    return parseAtom;
  }
}

function* parseRss(xmlData) {
  let channel = xmlData.getElementsByTagName('channel')[0];
  for (let item of channel.getElementsByTagName('item')) {
    let title = item.getElementsByTagName('title')[0].childNodes[0].nodeValue;
    let link = item.getElementsByTagName('link')[0].childNodes[0].nodeValue;
    let listNode = document.createElement('li');
    listNode.innerHTML = '<a href="'+ link + '">' + title +'</a>';
    yield listNode;
  }
}

function* parseAtom(xmlData) {
  let feed = xmlData.getElementsByTagName('feed')[0];
  for (let entry of feed.getElementsByTagName('entry')) {
    let title = entry.getElementsByTagName('title')[0].childNodes[0].nodeValue;
    let link = entry.getElementsByTagName('link')[0].href;
    let listNode = document.createElement('li');
    listNode.innerHTML = '<a href="'+ link + '">' + title +'</a>';
    yield listNode;
  }
}

window.onload = () => {
  init();
};