/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global Util, Feeds */

'use strict';

window.onload = onWindowLoaded;

function onWindowLoaded() {
  browser.storage.local.get('swapDisplays')
    .then((options) => init(options));
}

function init(options) {
  render(options.swapDisplays);
  initSidebar();
  initControls();
  initListeners();
}

function render(swapDisplays) {
  const feedsDiv = buildDisplayDiv('feeds-menu', 'feeds-list');
  const feedItemsDiv = buildDisplayDiv('display', 'feed-items');

  const body = document.getElementsByTagName('body')[0];
  const controlsDiv = document.getElementById('controls');

  if (!swapDisplays) {
    body.insertBefore(feedsDiv, controlsDiv);
    body.appendChild(feedItemsDiv);
  } else {
    body.insertBefore(feedItemsDiv, controlsDiv);
    body.appendChild(feedsDiv);
  }
}

function buildDisplayDiv(containerId, listId) {
  const div = document.createElement('div');
  div.id = containerId;
  const list = document.createElement('ul');
  list.id = listId;
  div.appendChild(list);
  return div;
}

function initSidebar() {
  browser.bookmarks.search('Simple Feeds').then(parseFeedsFolderSubtree);
}

function parseFeedsFolderSubtree(bookmarks) {
  browser.bookmarks.getSubTree(bookmarks[0].id).then(populateFeedsList);
}

function populateFeedsList(bookmarkItems) {
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
    .then(clearFeedsFromStorage);
}

function clearFeedsFromStorage(feeds) {
  browser.storage.local.remove('feeds').then(
    () => saveDiscoveredFeeds(feeds));
}

function saveDiscoveredFeeds(feeds) {
  browser.storage.local.set({feeds: feeds}).then(displayDiscoveredFeedsPanel);
}

function displayDiscoveredFeedsPanel() {
  browser.windows.create({
    url: browser.extension.getURL('dialog/discover.html'),
    type: 'panel',
    width: 500,
    height: 200
  });
}

function initListeners() {
  browser.runtime.onMessage.addListener(handleReceivedMessages);
}

async function handleReceivedMessages(message) {
  if (message.action === 'refresh') {
    initSidebar();
  }

  if (message.action === 'delete') {
    const result = await browser.storage.local.get('deleteId');
    await browser.bookmarks.remove(result.deleteId);
    await browser.storage.local.remove('deleteId');
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
  titleContainer.onclick = () => displayFeedContent(
    bookmark.url, titleContainer);
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

async function onDeleteButtonClicked() {
  const result = await browser.storage.local.get('deleteId');
  if (result.deleteId === undefined) {
    await browser.storage.local.set({deleteId: this.dataset.bookmarkId});
    browser.windows.create({
      url: browser.extension.getURL('dialog/delete.html'),
      type: 'panel',
      width: 500,
      height: 200,
      allowScriptsToClose: true
    });
  }

}

function displayFeedContent(url, feedTitleContainer) {
  toggleClassOnElement(feedTitleContainer, 'selected-feed');
  let feedItems = document.getElementById('feed-items');
  Util.clearNodeContent(feedItems);
  feedItems.appendChild(document.createTextNode('Loading...'));
  let requestData = {method: 'GET', mode: 'cors'};
  fetch(url, requestData)
    .then(response => response.text())
    .then(responseText => Util.parseXmlFromResponseText(responseText))
    .then(Feeds.selectFeedParser)
    .then(buildFragment)
    .then(applyFragment);
}

function toggleClassOnElement(elementToUpdate, className) {
  let otherElements = document.getElementsByClassName(className);
  for (let element of otherElements) {
    element.classList.remove(className);
  }
  elementToUpdate.parentNode.classList.add(className);
}

/**
 * @param parserData.parse The function to use to parse the feed
 * @param parserData.xml The feed XML
 */
function buildFragment(parserData) {
  return new Promise(function(resolve) {
    let fragment = document.createDocumentFragment();
    for (let listNode of parserData.parse(parserData.xml)) {
      fragment.appendChild(listNode);
    }
    resolve(fragment);
  });
}

function applyFragment(fragment) {
  return new Promise(function(resolve) {
    let feedItems = document.getElementById('feed-items');
    Util.clearNodeContent(feedItems);
    let panelContent = fragment.hasChildNodes() ?
      fragment : document.createTextNode('[No items in feed]');
    feedItems.append(panelContent);
    resolve();
  });
}
