/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/* global BookmarkService, WebExtensions,FeedService,
          Formatting, MessagingService, SettingsService
*/

'use strict';

const Index = {

  init(bookmarkService, feedService, messagingService, settingsService) {
    this._initServices(
      bookmarkService,
      feedService,
      messagingService,
      settingsService);
    this._initListeners();
    this._initPage();
  },

  _initListeners() {
    messagingService.addListener((message) => this.runtimeListener(message));
  },

  runtimeListener(message) {
    if (message === 'refresh') {
      location.reload();
    }
  },

  _initServices(
      bookmarkService,
      feedService,
      messagingService,
      settingsService) {
    this.bookmarkService = bookmarkService;
    this.feedService = feedService;
    this.messagingService = messagingService;
    this.settingsService = settingsService;
  },

  async _initPage() {
    this._applyTheme();
    this._applySwapDisplays();
    const bookmarks = await this.bookmarkService.getFeedBookmarks();
    const fragment = document.createDocumentFragment();
    bookmarks.forEach(bookmark => {
      fragment.appendChild(Formatting.Index.Bookmark.convertToNode(bookmark, {
        onSelect: (bookmark) => this.selectFeed(bookmark),
        onDelete: (bookmark) => this.deleteFeed(bookmark)
      }));
    });
    document.getElementById('feeds-list').appendChild(fragment);
    // TODO Refactor this and other listeners
    document.getElementById('ui-detect').onclick =
      () => this.feedService.detectFeeds();
  },

  async _applyTheme() {
    const link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = await this.settingsService.getTheme() + '.css';
    document.head.appendChild(link);
  },

  async _applySwapDisplays() {
    const swap = await this.settingsService.isSwapDisplaysEnabled();

    if (swap) {
      const wrap =document.getElementById('wrap');
      const feeds = document.getElementById('feeds');
      const feedContents = document.getElementById('feed-contents');
      const controls = document.getElementById('control-bar');

      wrap.removeChild(feeds);
      wrap.removeChild(feedContents);
      wrap.insertBefore(feedContents, controls);
      controls.parentNode.insertBefore(feeds, controls.nextSibling);
    }

  },

  async selectFeed(bookmark) {
    this._markAsSelected(`b-${bookmark.id}`);
    const feedItemsList = document.getElementById('feed-items-list');
    feedItemsList.innerHTML = 'Loading...';
    try {
      const feedItems = await this.feedService.getFeed(bookmark.url);
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
    document.getElementById(nodeId).classList.add('selected-feed');
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
    this.bookmarkService.deleteBookmark(bookmark);
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

    const recreatedBookmark = await this.bookmarkService.undoDelete(bookmark);
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
    this.bookmarkService.lastDeleted = null;
    const nodeForDeletion = document.getElementById(nodeId);
    nodeForDeletion.parentNode.removeChild(nodeForDeletion);
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

const webex = new WebExtensions();
const bookmarkService = new BookmarkService(webex);
const feedService = new FeedService(webex);
const messagingService = new MessagingService(webex);
const settingsService = new SettingsService(webex);
window.onload = () => Index.init(
  bookmarkService,
  feedService,
  messagingService,
  settingsService);