/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* exported Api */

'use strict';

/**
 * Wrapper layer around the Web Extenions APIs.
 */
const _wx = {};

_wx.bookmarks = browser.bookmarks;
_wx.extension = browser.extension;
_wx.runtime = browser.runtime;
_wx.storage = browser.storage.local;
_wx.tabs = browser.tabs;
_wx.windows = browser.windows;

/**
 * Application API layer
 */
const Api = {};

/**
 * Provides access to extension settings
 */
Api.Settings = {};

Api.Settings._DEFAULT = {
  darkTheme: false,
  swapDisplays: false
};

Api.Settings.get = async function() {
  const result = await _wx.storage.get('settings');
  if (result.settings === undefined) {
    _wx.storage.set({settings: Api.Settings._DEFAULT});
    return Api.Settings._DEFAULT;
  }
  return result.settings;
};

/**
 * Provides access to local browser storage API
 */
Api.Storage = {};

Api.Storage.get = async function(query) {
  return _wx.storage.get(query);
};

Api.Storage.set = function(data) {
  _wx.storage.set(data);
};

Api.Storage.remove = function(keys) {
  _wx.storage.remove(keys);
};

/**
 * Provides access to the Tabs API
 */
Api.Tabs = {};

Api.Tabs.sendMessageToActiveTab = async function(message) {
  const activeTab = await Api.Tabs._getActive();
  return Api.Tabs._sendMessage(activeTab.id, message);
};

Api.Tabs._getActive = async function() {
  const currentWindow = await _wx.windows.getCurrent();
  const tabs = await _wx.tabs.query({
    active: true,
    windowId: currentWindow.id
  });
  return tabs[0];
};

Api.Tabs._sendMessage = async function(tabId, action) {
  return _wx.tabs.sendMessage(tabId, {action: action});
};

/**
 * Provides access to the Windows API
 */
Api.Windows = {};

Api.Windows.createPanel = function(url, width, height, allowScriptsToClose) {
  _wx.windows.create({
    url: _wx.extension.getURL(url),
    type: 'panel',
    width: width,
    height: height,
    allowScriptsToClose: allowScriptsToClose ? allowScriptsToClose : false
  });
};

Api.Windows.getCurrent = async function() {
  return _wx.windows.getCurrent({});
};

/**
 * Provides access to the bookmarks API
 */
Api.Bookmarks = {};

Api.Bookmarks.getFeeds = async function() {
  const bookmarksFolder = await _wx.bookmarks.search('Simple Feeds');
  const feedsBookmark = bookmarksFolder[0];
  const bookmarks = await _wx.bookmarks.getSubTree(feedsBookmark.id);
  return bookmarks[0].children;
};

Api.Bookmarks.get = async function(id) {
  const bookmark = await _wx.bookmarks.getSubTree(id);
  return bookmark[0];
};

Api.Bookmarks.remove = function(id) {
  _wx.bookmarks.remove(id);
};


/**
 * Provides access to the Runtime API
 */
Api.Runtime = {};

Api.Runtime.addMessageListener = function(onMessageReceived) {
  _wx.runtime.onMessage.addListener(onMessageReceived);
};


/**
 * Provides access to DOM manipulation utilities
 */
Api.Dom = {};

Api.Dom.clearNodeContent = function(node) {
  while (node.hasChildNodes()) {
    node.removeChild(node.firstChild);
  }
};

Api.Dom.parseXmlFromResponseText = function(responseText) {
  return new Promise(function(resolve) {
    resolve(new window.DOMParser().parseFromString(responseText, 'text/xml'));
  });
};
