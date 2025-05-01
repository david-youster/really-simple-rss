/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import { Bookmark } from '../model.js';

const _wx = {
  bookmarks: browser.bookmarks,
  action: browser.action,
  sidebarAction: browser.sidebarAction,
  tabs: browser.tabs,
  windows: browser.windows,
  extension: browser.extension,
  storage: browser.storage.local,
  runtime: browser.runtime,
  menus: browser.menus,
};


export async function initBookmarks (folderName) {
  const searchResult = await _wx.bookmarks.search({ title: folderName });

  // Create the feed folder if the folder doesn't exist, or if an actual
  // bookmark with the folder name does exist.
  if (searchResult.length === 0 || searchResult[0].type !== 'folder') {
    await _wx.bookmarks.create({ title: folderName, type: 'folder' });
  }
}

export async function getBookmarks(folderName) {
  const searchResult = await _wx.bookmarks.search({ title: folderName });

  // Search result will also contain bookmarks with the folder name. These
  // should be discarded.
  const folders = searchResult.filter(b => b.type === 'folder');
  if (folders.length === 0) {
    return [];
  }

  // It's possible to have multiple bookmark folders with the same name.
  // Not concerned about this for now - if multiple bookmarks folders are
  // found, just use the first one in the result.
  const subTree = await _wx.bookmarks.getSubTree(folders[0].id);
  return subTree[0].children.map(_mapBookmarkToModel);
}

function _mapBookmarkToModel (wxBookmark) {
  const bookmark = new Bookmark(wxBookmark);
  if (wxBookmark.type === 'folder') {
    bookmark.children = wxBookmark.children.map(_mapBookmarkToModel);
  }
  return bookmark;
};

// TODO error handling if parent is not a folder
// TODO ensure either ID or title is passed
export async function createBookmark (bookmark, parent) {
  let parentId = null;

  if (parent) {
    const parentQuery = await _wx.bookmarks.search({ title: parent });
    parentId = parentQuery[0] ? parentQuery[0].id : null;
  }

  return new Bookmark(await _wx.bookmarks.create({
    parentId: parentId ? parentId : bookmark.parentId,
    title: bookmark.title,
    url: bookmark.url,
    index: bookmark.index
  }));
};

export async function removeBookmark(bookmarkId) {
  await _wx.bookmarks.remove(bookmarkId);
};

export function setBrowserAction(onClicked) {
  _wx.action.onClicked.addListener(onClicked);
};

export function openSidebar () {
  _wx.sidebarAction.open();
};

export async function getCurrentTab () {
  const currentWindow = await _wx.windows.getCurrent();
  const tabs = await _wx.tabs.query({
    active: true,
    windowId: currentWindow.id
  });
  return tabs[0];
};

export async function newTab (url, active) {
  await _wx.tabs.create({ url, active });
};

export async function discoverFeeds () {
  const currentTab = await getCurrentTab();
  return _wx.tabs.sendMessage(currentTab.id, 'discover');
};

export async function sendMessage (message) {
  _wx.runtime.sendMessage(message);
};

export function addListener (onMessageReceived) {
  _wx.runtime.onMessage.addListener(onMessageReceived);
};

export async function createPanel (source, data) {
  await save('panelData', { [source]: data });

  await _wx.windows.create({
    url: _wx.runtime.getURL(source),
    type: 'panel',
    width: 500,
    height: 250,
    allowScriptsToClose: true
  });
};

export async function save (key, value) {
  await _wx.storage.set({ [key]: value });
};

export async function load(key) {
  const result = await _wx.storage.get(key);
  return result[key] !== null && result[key] !== undefined ?
    result[key] : null;
};

export function addMenuShownListener (onShown) {
  _wx.menus.onShown.addListener(onShown);
};

export function addMenuItemClickListener (onClicked) {
  _wx.menus.onClicked.addListener(onClicked);
};

export function addMenuHiddenListener (onHidden) {
  _wx.menus.onHidden.addListener(onHidden);
};

export function getTargetElement (id) {
  return _wx.menus.getTargetElement(id);
};

export function addMenuItem (id, title) {
  _wx.menus.create({ id, title }, async () => await _wx.menus.refresh());
};

export async function removeAllMenuItems () {
  await _wx.menus.removeAll();
  await _wx.menus.refresh();
};