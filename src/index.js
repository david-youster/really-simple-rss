/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* global Bookmarks,Feeds, Formatting, Messaging, Settings */

'use strict';

const IndexPage = {

  data: {
    selectedFeed: null
  },

  init(settingsService) {
    this._initServices(settingsService);
    this._initListeners();
    this._initPage();
  },

  _initListeners() {
    Messaging.addListener((message) => this.runtimeListener(message));
  },

  runtimeListener(message) {
    if (message === 'bookmark-added') {
      this._updateFeedList();
    }

    if (message === 'theme') {
      this._applyTheme();
    }

    if (message === 'swap') {
      this._applySwapDisplays();
    }
  },

  _initServices(settingsService) {
    this.settingsService = settingsService;
  },

  async _initPage() {
    this._applyTheme();
    this._applySwapDisplays();
    this._populateFeedList();
    // TODO Refactor this and other listeners
    document.getElementById('ui-detect').onclick = () => Feeds.detectFeeds();
  },

  async _applyTheme() {
    let link = document.getElementById('theme-stylesheet');

    if (link === null) {
      link = document.createElement('link');
      document.head.appendChild(link);
    }

    link.id = 'theme-stylesheet';
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = await Settings.getTheme() + '.css';
  },

  async _applySwapDisplays() {
    const swap = await Settings.isSwapDisplaysEnabled();
    const wrap = document.getElementById('wrap');
    const feeds = document.getElementById('feeds');
    const feedContents = document.getElementById('feed-contents');
    const controls = document.getElementById('control-bar');

    wrap.removeChild(feeds);
    wrap.removeChild(feedContents);

    if (swap) {
      wrap.insertBefore(feedContents, controls);
      wrap.insertBefore(feeds, controls.nextSibling);
    } else {
      wrap.insertBefore(feeds, controls);
      wrap.insertBefore(feedContents, controls.nextSibling);
    }

  },

  async _populateFeedList() {
    const bookmarks = await Bookmarks.getFeedBookmarks();
    const fragment = document.createDocumentFragment();
    bookmarks.forEach(bookmark => {

      fragment.appendChild(
        Formatting.Index.Bookmark.convertToNode(bookmark, {
          onSelect: (bookmark) => this.selectFeed(bookmark),
          onDelete: (bookmark) => this.deleteFeed(bookmark)
        }, { selectedFeed: this.data.selectedFeed }));

    });
    const feedsList = document.getElementById('feeds-list');
    feedsList.innerHTML = '';
    feedsList.appendChild(fragment);
  },

  async _updateFeedList() {
    const bookmarks = await Bookmarks.getFeedBookmarks();

    if (bookmarks.length === 0) {
      return;
    }

    // This assumes the bookmark will always be first in the list. This should
    // always be the case, but might need to re-visit this later
    const bookmark = bookmarks[0];

    const newNode = Formatting.Index.Bookmark.convertToNode(bookmark, {
      onSelect: (bookmark) => this.selectFeed(bookmark),
      onDelete: (bookmark) => this.deleteFeed(bookmark)
    }, { selectedFeed: this.data.selectedFeed });

    const feedsList = document.getElementById('feeds-list');
    feedsList.insertBefore(newNode, feedsList.firstChild);
  },

  async selectFeed(bookmark) {
    this.data.selectedFeed = bookmark.id;
    this._markAsSelected(`b-${bookmark.id}`);
    const feedItemsList = document.getElementById('feed-items-list');
    feedItemsList.innerHTML = 'Loading...';
    try {
      const feedItems = await Feeds.getFeed(bookmark.url);
      const fragment = document.createDocumentFragment();
      feedItemsList.innerHTML = '';

      feedItems.forEach(feedItem =>
        fragment.appendChild(
          Formatting.Index.FeedItem.convertToNode(feedItem)));

      document.getElementById('feed-items-list').appendChild(
        fragment.hasChildNodes() ?
          fragment : document.createTextNode('No content in feed'));

    } catch (error) {
      feedItemsList.innerHTML = '';
      feedItemsList.appendChild(document.createTextNode(
        'An error occurred - couldn\'t load feed content'));
    }
  },

  _markAsSelected(nodeId) {
    const feedsList = document.getElementById('feeds-list');
    const selectedFeed = feedsList.querySelectorAll('.selected-feed')[0];
    if (selectedFeed) {
      selectedFeed.classList.remove('selected-feed');
    }

    const selectedFeedNode = document.getElementById(nodeId);

    if (selectedFeedNode !== null) {
      selectedFeedNode.classList.add('selected-feed');
    }
  },

  async deleteFeed(bookmark) {
    const nodeId = `b-${bookmark.id}`;
    this._toggleNodeVisibility(nodeId);
    await this._deleteBookmark(bookmark);
    this._offerUndoDelete(bookmark);
    document.getElementById('ui-undo').focus();
  },

  _toggleNodeVisibility(nodeId) {
    document.getElementById(nodeId).classList.toggle('hidden');
  },

  async _deleteBookmark(bookmark) {
    Bookmarks.deleteBookmark(bookmark);
  },


  // TODO Refactor undo delete functionality
  _offerUndoDelete(bookmark) {
    document.getElementById('ui-detect').style.display = 'none';
    document.getElementById('wrap-undo-controls').style.display = 'block';
    const deleteButtons = document.getElementsByClassName('ui-delete');

    for (let item of deleteButtons) {
      item.disabled = true;
    }

    document.getElementById('ui-undo').onclick = () => {
      this.undoDelete(bookmark);
      this.revertControls();
    };
    document.getElementById('ui-undo-dismiss').onclick = () => {
      this.dismissUndoDelete(`b-${bookmark.id}`);
      this.revertControls();
    };
  },

  async undoDelete(bookmark) {
    // TODO this belongs in a Formatting function, not here.
    // Alternatively, just refresh the sidebar page

    const recreatedBookmark = await Bookmarks.undoDelete(bookmark);
    const newId = `b-${recreatedBookmark.id}`;
    const node = document.getElementById(`b-${bookmark.id}`);
    node.id = newId;
    let deleteButton = document.getElementById(`ui-delete-${bookmark.id}`);
    deleteButton.id = `ui-delete-${recreatedBookmark.id}`;
    this._toggleNodeVisibility(newId);

    node.onclick = () => this.selectFeed(recreatedBookmark);
    deleteButton.onclick = () => this.deleteFeed(recreatedBookmark);
  },

  dismissUndoDelete(nodeId) {
    Bookmarks.lastDeleted = null;
    const nodeForDeletion = document.getElementById(nodeId);
    const parentId = nodeForDeletion.dataset.parentId;
    nodeForDeletion.parentNode.removeChild(nodeForDeletion);

    const parentNode = document.getElementById(`b-${parentId}`);
    const folderContents = parentNode !== null
      ? parentNode.querySelector('ul')
      : null;

    if (parentNode !== null && !folderContents.hasChildNodes()) {
      document.getElementById(`ui-delete-${parentId}`).style.display = '';
    }
  },

  revertControls() {
    const deleteButtons = document.getElementsByClassName('ui-delete');
    for (let item of deleteButtons) {
      item.disabled = false;
    }
    document.getElementById('ui-detect').style.display = 'inline';
    document.getElementById('wrap-undo-controls').style.display = 'none';
  }
};

window.onload = () => IndexPage.init();