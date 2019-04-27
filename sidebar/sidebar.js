/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global Api */

'use strict';

window.onload = onWindowLoaded;

function onWindowLoaded() {
  init();
}

async function init() {
  const settings = await Api.Settings.get();
  const theme = settings.darkTheme ? 'dark' : 'light';
  render(settings.swapDisplays, theme);
  initSidebar(theme);
  initControls();
  initListeners();
}

function render(swapDisplays, theme) {
  Api.Sidebar.setTheme(theme);
  Api.Sidebar.renderDisplays(swapDisplays, theme);
}


async function initSidebar(theme) {
  const bookmarks = await Api.Bookmarks.getFeeds();
  populateFeedsList(bookmarks, theme);
}

function populateFeedsList(bookmarks, theme) {
  let feedsList = document.getElementById('feeds-list');
  const onCreateListNode = Api.Sidebar.createBookmarkListNode;
  Api.Sidebar.populateList(feedsList, bookmarks, theme, onCreateListNode);
}

function initControls() {
  Api.Sidebar.setOnClickListener('discover-button', onControlButtonClicked);
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

function handleReceivedMessages(message) {
  if (message.action === 'refresh') {
    Api.Sidebar.refreshFeedList();
  }

  if (message.action === 'delete') {
    Api.Sidebar.deleteFeed();
  }
}
