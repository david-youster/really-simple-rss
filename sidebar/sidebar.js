/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global Api, Util, Feeds */

'use strict';

window.onload = onWindowLoaded;

async function onWindowLoaded() {
  const result = await Api.Storage.get('settings');
  init(result.settings);
}

function init(settings) {
  if (settings === undefined) {
    settings = {
      darkTheme: false,
      swapDisplays: false
    };

    Api.Storage.set({settings: settings});
  }
  const theme = settings.darkTheme ? 'dark' : 'light';
  render(settings.swapDisplays, theme);
  initSidebar(theme);
  initControls();
  initListeners();
}

function render(swapDisplays, theme) {
  const styleSheetLink = document.createElement('link');
  styleSheetLink.type = 'text/css';
  styleSheetLink.href = '/common/' + theme + '.css';
  styleSheetLink.rel = 'stylesheet';
  document.head.appendChild(styleSheetLink);

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

  const discoverButton = document.createElement('input');
  discoverButton.id = 'discover-button';
  discoverButton.type = 'image';
  discoverButton.src = '/icons/' + theme + '/magnifier.svg';
  controlsDiv.appendChild(discoverButton);
}

function buildDisplayDiv(containerId, listId) {
  const div = document.createElement('div');
  div.id = containerId;
  const list = document.createElement('ul');
  list.id = listId;
  div.appendChild(list);
  return div;
}

async function initSidebar(theme) {
  const bookmarks = await Api.Bookmarks.getFeeds();
  populateFeedsList(bookmarks, theme);
}

function populateFeedsList(bookmarks, theme) {
  let feedsList = document.getElementById('feeds-list');
  Util.populateList(feedsList, bookmarks, theme, onCreateBookmarkListNode);
}

function initControls() {
  document.getElementById('discover-button').onclick =
      () => onControlButtonClicked();
}

async function onControlButtonClicked() {
  await Api.Storage.remove('feeds');
  const discoveredFeeds = await Api.Tabs.sendMessageToActiveTab('discover');
  Api.Storage.set({feeds: discoveredFeeds});
  Api.Windows.createPanel('dialog/discover.html', 500, 200);
}

function initListeners() {
  Api.Runtime.addMessageListener(handleReceivedMessages);
}

async function handleReceivedMessages(message) {
  if (message.action === 'refresh') {
    const result = await Api.Storage.get(['newBookmarkId', 'settings']);
    const bookmark = await Api.Bookmarks.get(result.newBookmarkId);
    const theme = result.settings.darkTheme ? 'dark' : 'light';
    const listNode = onCreateBookmarkListNode(bookmark, theme);
    const feedsList = document.getElementById('feeds-list');
    feedsList.insertBefore(listNode, feedsList.children[0]);
    Api.Storage.remove('newBookmarkId');
  }

  if (message.action === 'delete') {
    const result = await Api.Storage.get('deleteId');
    await Api.Bookmarks.remove(result.deleteId);
    await Api.Storage.remove('deleteId');
    const listNode = document.getElementById(`b-${result.deleteId}`);
    listNode.parentNode.removeChild(listNode);
  }
}

function onCreateBookmarkListNode(bookmark, theme) {
  let listNode = document.createElement('li');
  listNode.id = `b-${bookmark.id}`;
  listNode.appendChild(createListNodeTextSection(bookmark));
  listNode.appendChild(createListNodeControlSection(bookmark, theme));
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

function createListNodeControlSection(bookmark, theme) {
  let controlContainer = document.createElement('div');
  controlContainer.classList.add('feed-control-container');
  let deleteButton = document.createElement('input');
  deleteButton.type = 'image';
  deleteButton.src = '/icons/' + theme + '/delete.svg';
  deleteButton.style.height = '15px';
  deleteButton.dataset.bookmarkId = bookmark.id;
  deleteButton.onclick = onDeleteButtonClicked;
  controlContainer.appendChild(deleteButton);
  return controlContainer;
}

async function onDeleteButtonClicked() {
  const result = await Api.Storage.get('deleteId');
  if (result.deleteId === undefined) {
    await Api.Storage.set({deleteId: this.dataset.bookmarkId});
    Api.Windows.createPanel('dialog/delete.html', 500, 200, true);
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
