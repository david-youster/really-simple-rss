/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global Util, Feeds */

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
  document.getElementById('discover-button').onclick =
      () => onControlButtonClicked(sendDiscoverMessage);
}

function onControlButtonClicked(onGetActiveTab) {
  browser.windows.getCurrent({}).then(
    (currentWindow) => getCurrentWindow(currentWindow, onGetActiveTab)
  );
}

function getCurrentWindow(window, onGetActiveTab) {
  browser.tabs.query({active: true, windowId: window.id}).then(onGetActiveTab);
}

function sendDiscoverMessage(tabs) {
  browser.tabs.sendMessage(tabs[0].id, {action: 'discover'})
    .then(onDiscoveredFeedsReceived);
}

function onDiscoveredFeedsReceived(feeds) {
  browser.storage.local.clear().then(() => onLocalStorageCleared(feeds));
}

function onLocalStorageCleared(feeds) {
  browser.storage.local.set({feeds: feeds}).then(onDiscoveredFeedsSaved);
}

function onDiscoveredFeedsSaved() {
  browser.windows.create({
    url: browser.extension.getURL('dialog/discover.html'),
    type: 'panel',
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
  titleContainer.onclick = () => onFeedSelected(bookmark.url, titleContainer);
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
  if (confirm('Delete bookmark?')) {
    browser.bookmarks.remove(this.dataset.bookmarkId).then(initSidebar);
  }
}

function onFeedSelected(url, feedTitleContainer) {
  toggleClassOnElement(feedTitleContainer, 'selected-feed');
  let feedItems = document.getElementById('feed-items');
  Util.clearNodeContent(feedItems);
  feedItems.appendChild(document.createTextNode('Loading...'));
  let requestData = {method: 'GET', mode: 'cors'};
  fetch(url, requestData)
    .then(response => response.text())
    .then(responseText => Util.parseXmlFromResponseText(responseText))
    .then(populateFeedDisplay);
}

function toggleClassOnElement(elementToUpdate, className) {
  let otherElements = document.getElementsByClassName(className);
  for (let element of otherElements) {
    element.classList.remove(className);
  }
  elementToUpdate.parentNode.classList.add(className);
}

function populateFeedDisplay(xmlData) {
  let parserFunction = Feeds.selectFeedParser(xmlData);
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
