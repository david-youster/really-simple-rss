/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global Api, Feeds */

/**
 * Provides API access and document manipulation functionality for the sidebar
 */
Api.Sidebar = {};

Api.Sidebar.setTheme = function(theme) {
  const styleSheetLink = document.createElement('link');
  styleSheetLink.type = 'text/css';
  styleSheetLink.href = '/common/' + theme + '.css';
  styleSheetLink.rel = 'stylesheet';
  document.head.appendChild(styleSheetLink);
};

Api.Sidebar.renderDisplays = function(swapDisplays, theme) {
  const feedsDiv = Api.Sidebar._buildDisplayDiv('feeds-menu', 'feeds-list');
  const feedItemsDiv = Api.Sidebar._buildDisplayDiv('display', 'feed-items');

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
};

Api.Sidebar._buildDisplayDiv = function(containerId, listId) {
  const div = document.createElement('div');
  div.id = containerId;
  const list = document.createElement('ul');
  list.id = listId;
  div.appendChild(list);
  return div;
};

Api.Sidebar.setOnClickListener = function(id, onClick) {
  document.getElementById(id).onclick = onClick;
};

Api.Sidebar.refreshFeedList = async function() {
  const result = await Api.Storage.get(['newBookmarkId', 'settings']);
  const bookmark = await Api.Bookmarks.get(result.newBookmarkId);
  const theme = result.settings.darkTheme ? 'dark' : 'light';
  const listNode = Api.Sidebar.createBookmarkListNode(bookmark, theme);
  const feedsList = document.getElementById('feeds-list');
  feedsList.insertBefore(listNode, feedsList.children[0]);
  Api.Storage.remove('newBookmarkId');
};

Api.Sidebar.deleteFeed = async function() {
  const result = await Api.Storage.get('deleteId');
  await Api.Bookmarks.remove(result.deleteId);
  await Api.Storage.remove('deleteId');
  const listNode = document.getElementById(`b-${result.deleteId}`);
  listNode.parentNode.removeChild(listNode);
};

Api.Sidebar.createBookmarkListNode = function(bookmark, theme) {
  const listNode = document.createElement('li');
  listNode.id = `b-${bookmark.id}`;
  listNode.appendChild(Api.Sidebar._createListNodeTextSection(bookmark));
  listNode.appendChild(
    Api.Sidebar._createListNodeControlSection(bookmark, theme));
  return listNode;
};

Api.Sidebar._createListNodeTextSection = function(bookmark) {
  let titleContainer = document.createElement('div');
  titleContainer.classList.add('feed-title-container');
  titleContainer.appendChild(
    document.createTextNode(bookmark.title ? bookmark.title : bookmark.url));
  titleContainer.onclick =
    () => Api.Sidebar.displayFeedContent(bookmark.url, titleContainer);
  return titleContainer;
};

Api.Sidebar._createListNodeControlSection = function(bookmark, theme) {
  let controlContainer = document.createElement('div');
  controlContainer.classList.add('feed-control-container');
  let deleteButton = document.createElement('input');
  deleteButton.type = 'image';
  deleteButton.src = '/icons/' + theme + '/delete.svg';
  deleteButton.style.height = '15px';
  deleteButton.dataset.bookmarkId = bookmark.id;
  deleteButton.onclick = Api.Sidebar.handleDeleteFeed;
  controlContainer.appendChild(deleteButton);
  return controlContainer;
};

Api.Sidebar.handleDeleteFeed = async function() {
  const result = await Api.Storage.get('deleteId');
  if (result.deleteId === undefined) {
    await Api.Storage.set({deleteId: this.dataset.bookmarkId});
    Api.Windows.createPanel('dialog/delete.html', 500, 200, true);
  }
};

Api.Sidebar.displayFeedContent = function(url, feedTitleContainer) {
  Api.Sidebar.toggleClassOnElement(feedTitleContainer, 'selected-feed');
  let feedItems = document.getElementById('feed-items');
  Api.Dom.clearNodeContent(feedItems);
  feedItems.appendChild(document.createTextNode('Loading...'));
  let requestData = {method: 'GET', mode: 'cors'};
  fetch(url, requestData)
    .then(response => response.text())
    .then(responseText => Api.Dom.parseXmlFromResponseText(responseText))
    .then(Feeds.selectFeedParser)
    .then(Api.Sidebar.buildFragment)
    .then(Api.Sidebar.applyFragment);
};

Api.Sidebar.toggleClassOnElement = function (elementToUpdate, className) {
  let otherElements = document.getElementsByClassName(className);
  for (let element of otherElements) {
    element.classList.remove(className);
  }
  elementToUpdate.parentNode.classList.add(className);
};

/**
 * @param parserData.parse The function to use to parse the feed
 * @param parserData.xml The feed XML
 */
Api.Sidebar.buildFragment = function(parserData) {
  return new Promise(function(resolve) {
    let fragment = document.createDocumentFragment();
    for (let listNode of parserData.parse(parserData.xml)) {
      fragment.appendChild(listNode);
    }
    resolve(fragment);
  });
};

Api.Sidebar.applyFragment = function(fragment) {
  return new Promise(function(resolve) {
    let feedItems = document.getElementById('feed-items');
    Api.Dom.clearNodeContent(feedItems);
    let panelContent = fragment.hasChildNodes() ?
      fragment : document.createTextNode('[No items in feed]');
    feedItems.append(panelContent);
    resolve();
  });
};

Api.Sidebar.populateList = function(listNode, collection, theme, onBuildNode) {
  let fragment = document.createDocumentFragment();
  for (let item of collection) {
    fragment.appendChild(onBuildNode(item, theme));
  }
  Api.Dom.clearNodeContent(listNode);
  listNode.appendChild(fragment);
};