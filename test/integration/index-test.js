/* global QUnit, Index, BookmarkService, FeedService
          Bookmark, FeedItem
          bookmarkService, feedService, messagingService, settingsService
*/

'use strict';

window.onload = null;

async function initIndexPage() {
  Index.init(
    bookmarkService,
    feedService,
    messagingService,
    settingsService);
}

function mockBookmarks() {
  BookmarkService.prototype.getFeedBookmarks = () => [
    new Bookmark({
      id: 'id1',
      title: 'bm1',
      url: 'http://www.url1.com',
      index: 0
    }),
    new Bookmark({
      id: 'id2',
      title: 'bm2',
      url: 'http://www.url2.com',
      index: 1
    })
  ];
}

function mockFeed() {
  FeedService.prototype.getFeed = () => [
    new FeedItem({
      title: 'Item 1',
      link: 'www.item1.com',
      decription: 'Description of item 1'
    }),
    new FeedItem({
      title: 'Item 2',
      link: 'www.item2.com'
    })
  ];
}

QUnit.test(
  'when no feed bookmarks exist, then feeds list contains no elements',
  async function(assert) {
    BookmarkService.prototype.getFeedBookmarks = () => [];
    await initIndexPage();
    assert.equal(document.getElementById('feeds-list').childElementCount, 0);
  }
);

QUnit.test(
  'when feed bookmarks are found, then feeds list is populated',
  async function(assert) {
    mockBookmarks();
    await initIndexPage();
    assert.equal(document.getElementById('feeds-list').childElementCount, 2);
  }
);

QUnit.test(
  'when feed is selected, then feed is marked as selected',
  async function(assert) {
    mockBookmarks();
    await initIndexPage();
    const feedListNode = document.getElementById('b-id1');
    assert.notOk(feedListNode.classList.contains('selected-feed'));
    await feedListNode.querySelector('#ui-select-id1').click();
    assert.ok(feedListNode.classList.contains('selected-feed'));
  }
);


QUnit.test(
  'when feed is selected, then other feeds are marked as unselected',
  async function(assert) {
    mockBookmarks();
    await initIndexPage();
    const firstFeed = document.getElementById('b-id1');
    assert.notOk(firstFeed.classList.contains('selected-feed'));
    const secondFeed = document.getElementById('b-id2');
    assert.notOk(secondFeed.classList.contains('selected-feed'));

    await firstFeed.querySelector('#ui-select-id1').click();
    assert.ok(firstFeed.classList.contains('selected-feed'));
    assert.notOk(secondFeed.classList.contains('selected-feed'));

    await secondFeed.querySelector('#ui-select-id2').click();
    assert.notOk(firstFeed.classList.contains('selected-feed'));
    assert.ok(secondFeed.classList.contains('selected-feed'));
  }
);

QUnit.test(
  'when feed is selected, then feed items list is populated',
  async function(assert) {
    mockBookmarks();
    mockFeed();
    await initIndexPage();

    const feedItemsList = document.getElementById('feed-items-list');
    assert.equal(feedItemsList.childElementCount, 0);

    await document.getElementById('ui-select-id1').click();
    assert.equal(feedItemsList.childElementCount, 2);
  }
);

QUnit.test(
  'when feed is deleted, then item is hidden',
  async function(assert) {
    mockBookmarks();
    mockFeed();
    await initIndexPage();
    await document.getElementById('ui-delete-id1').click();
    assert.ok(document.getElementById('b-id1').classList.contains('hidden'));
  }
);
