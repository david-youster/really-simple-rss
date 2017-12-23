/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global Util */

'use strict';

window.onload = onWindowLoaded;

function onWindowLoaded() {
  init();
}

function init() {
  initSidebar();
  initControls();
  initListeners();
}

function initSidebar() {
  browser.bookmarks.search('Simple Feeds').then(onFeedsFolderFound);
}

function onFeedsFolderFound(bookmarks) {
  browser.bookmarks.getSubTree(bookmarks[0].id).then(onBookmarksSubTreeParsed);
}

function onBookmarksSubTreeParsed(bookmarkItems) {
  let bookmarks = bookmarkItems[0].children;
  let feedsList = document.getElementById('feeds-list');
  Util.populateList(feedsList, bookmarks, onCreateBookmarkListNode);
}

function initControls() {
  document.getElementById('discover-button').onclick = onDiscoverButtonClicked;
}

function onDiscoverButtonClicked() {
  browser.windows.create({
    url: browser.extension.getURL('dialog/discover.html'),
    type: 'popup',
    width: 500,
    height: 200
  });
}


function initListeners() {
  browser.runtime.onMessage.addListener(onMessageReceived);
}

function onMessageReceived(message) {
  if (message.action === 'refresh') {
    initSidebar();
  }
}

function onCreateBookmarkListNode(bookmark) {
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
  deleteButton.style.height = '15px';
  deleteButton.dataset.bookmarkId = bookmark.id;
  deleteButton.onclick = onDeleteButtonClicked;
  controlContainer.appendChild(deleteButton);
  return controlContainer;
}

function onDeleteButtonClicked() {
  browser.bookmarks.remove(this.dataset.bookmarkId).then(initSidebar);
}

function parseAndDisplayFeed(url) {
  let feedItems = document.getElementById('feed-items');
  Util.clearNodeContent(feedItems);
  feedItems.appendChild(document.createTextNode('Loading...'));
  let requestData = {method: 'GET', mode: 'cors'};
  fetch(url, requestData)
    .then(response => response.text())
    .then(responseText => parseXmlFromResponseText(responseText))
    .then(onXmlResponseDataParsed);
}

function parseXmlFromResponseText(responseText) {
  return (new window.DOMParser()).parseFromString(responseText, 'text/xml');
}

function onXmlResponseDataParsed(xmlData) {
  let parserFunction = selectFeedParser(xmlData);
  let fragment = document.createDocumentFragment();
  let feedItems = document.getElementById('feed-items');
  for (let listNode of parserFunction(xmlData)) {
    fragment.appendChild(listNode);
  }

  Util.clearNodeContent(feedItems);
  let panelContent = fragment.hasChildNodes() ?
    fragment : document.createTextNode('[No items in feed]');
  feedItems.append(panelContent);
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
    listNode.appendChild(createAnchor(link, title));
    yield listNode;
  }
}

function* parseAtom(xmlData) {
  let feed = xmlData.getElementsByTagName('feed')[0];
  for (let entry of feed.getElementsByTagName('entry')) {
    let title = entry.getElementsByTagName('title')[0].childNodes[0].nodeValue;
    let link = entry.getElementsByTagName('link')[0].href;
    let listNode = document.createElement('li');
    listNode.appendChild(createAnchor(link, title));
    yield listNode;
  }
}

function createAnchor(href, text) {
  let anchor = document.createElement('a');
  anchor.href = href;
  anchor.appendChild(document.createTextNode(text));
  return anchor;
}