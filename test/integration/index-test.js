/* global QUnit, IndexPage, Feeds, FeedItem */

'use strict';

window.onload = null;

const TIMEOUT = 0;

async function initIndexPage() {
  IndexPage.init();
}

function mockEmptyBookmarksFolder() {
  browser.bookmarks._bookmarks = [{
    id: 'rootId',
    title: 'Simple Feeds',
    type: 'folder',
    index: 0,
  }];
}

function mockBookmarks() {
  const rootFolder = {
    id: 'rootId',
    title: 'Simple Feeds',
    type: 'folder',
    index: 0,
  };

  rootFolder.children = [
    {
      id: 'id1',
      title: 'bm1',
      url: '/url1.com',
      type: 'bookmark',
      index: 0
    },
    {
      id: 'id2',
      title: 'bm2',
      url: '/url2.com',
      type: 'bookmark',
      index: 1
    }
  ];

  browser.bookmarks._bookmarks = [rootFolder];
}

function mockFeed() {
  Feeds.getFeed = () => [
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
    const done = assert.async();
    mockEmptyBookmarksFolder();
    await initIndexPage();

    setTimeout(() => {
      assert.equal(document.getElementById('feeds-list').childElementCount, 0);
      done();
    }, TIMEOUT);

  }
);

QUnit.test(
  'when feed bookmarks are found, then feeds list is populated',
  async function(assert) {
    const done = assert.async();
    mockBookmarks();
    await initIndexPage();

    setTimeout(() => {
      assert.equal(document.getElementById('feeds-list').childElementCount, 2);
      done();
    }, TIMEOUT);
  }
);

QUnit.test(
  'when feed is selected, then feed is marked as selected',
  async function(assert) {
    const done = assert.async(2);
    mockBookmarks();
    await initIndexPage();

    setTimeout(() => {
      assert.notOk(
        document.getElementById('b-id1').classList.contains('selected-feed'));
      done();
    }, TIMEOUT);


    setTimeout(() => {
      document.getElementById('ui-select-id1').click();
      assert.ok(
        document.getElementById('b-id1').classList.contains('selected-feed'));
      done();
    }, TIMEOUT);
  }
);


QUnit.test(
  'when feed is selected, then other feeds are marked as unselected',
  async function(assert) {
    const done = assert.async(3);

    mockBookmarks();
    await initIndexPage();

    setTimeout(() => {
      assert.notOk(
        document.getElementById('b-id1').classList.contains('selected-feed'));
      assert.notOk(
        document.getElementById('b-id2').classList.contains('selected-feed'));
      done();
    }, TIMEOUT);

    setTimeout(() => {
      const firstFeed = document.getElementById('b-id1');
      firstFeed.querySelector('#ui-select-id1').click();
      assert.ok(firstFeed.classList.contains('selected-feed'));
      assert.notOk(
        document.getElementById('b-id2').classList.contains('selected-feed'));
      done();
    }, TIMEOUT);

    setTimeout(() => {
      document.getElementById('ui-select-id2').click();
      assert.notOk(
        document.getElementById('b-id1').classList.contains('selected-feed'));
      assert.ok(
        document.getElementById('b-id2').classList.contains('selected-feed'));
      done();
    }, TIMEOUT);
  }
);

QUnit.test(
  'when feed is selected, then feed items list is populated',
  async function(assert) {
    const done = assert.async(2);
    mockBookmarks();
    mockFeed();
    await initIndexPage();
    setTimeout(() => {
      assert.equal(
        document.getElementById('feed-items-list').childElementCount, 0);
      done();
    }, TIMEOUT);

    setTimeout(() => {
      document.getElementById('ui-select-id1').click();

      setTimeout(() => {
        assert.equal(
          document.getElementById('feed-items-list').childElementCount, 2);
        done();
      }, TIMEOUT);

    }, TIMEOUT);
  }
);

QUnit.test(
  'when feed is deleted, then item is hidden',
  async function(assert) {
    const done = assert.async();
    mockBookmarks();
    mockFeed();
    await initIndexPage();
    setTimeout(() => {
      document.getElementById('ui-delete-id1').click();

      setTimeout(() => {
        assert.ok(
          document.getElementById('b-id1').classList.contains('hidden'));
        done();
      }, TIMEOUT);

    }, TIMEOUT);
  }
);

QUnit.test(
  'when feed is deleted, then undo controls are displayed',
  async function(assert) {
    const done = assert.async();
    mockBookmarks();
    mockFeed();
    await initIndexPage();
    setTimeout(() => {
      document.getElementById('ui-delete-id1').click();

      setTimeout(() => {
        const undoControls = document.getElementById('wrap-undo-controls');
        assert.ok(undoControls.style.display = 'block');
        done();
      }, TIMEOUT);

    }, TIMEOUT);
  }
);

QUnit.test(
  'when undo controls are displayed, then other delete buttons are disabled',
  async function(assert) {
    const done = assert.async();
    mockBookmarks();
    mockFeed();
    await initIndexPage();
    setTimeout(() => {
      document.getElementById('ui-delete-id1').click();

      setTimeout(() => {
        const undoControls = document.getElementById('wrap-undo-controls');
        assert.ok(undoControls.style.display = 'block');
        document.getElementById('ui-delete-id2').disabled = true;
        done();
      }, TIMEOUT);

    }, TIMEOUT);
  }
);

