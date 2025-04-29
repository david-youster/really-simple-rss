/* global QUnit, Feed, DiscoveredFeedsPage
*/

'use strict';

window.onload = null;

const TIMEOUT = 0;

const DEFAULT_SETTINGS = {
  schema: '2.0.0',
  theme: 'default',
  swapDisplays: false
};

const DEFAULT_PANEL_DATA = [
  new Feed('Feed 1', 'https://feed1.com'),
  new Feed('Feed 2', 'https://feed2.com')
];

async function initDiscoverPage() {
  DiscoveredFeedsPage.init();
}

function mockSettings(settings = DEFAULT_SETTINGS) {
  browser.storage.local._data.settings = settings;
}

function mockPanelData(panelData = DEFAULT_PANEL_DATA) {
  browser.storage.local._data.panelData = { 'discover.html': panelData };
}

function collectionContains(collection, predicate) {
  for (let i = 0; i < collection.length; ++i) {
    if (predicate(collection[i])) {
      return true;
    }
  }
  return false;
}

function tearDown() {
  let linkTags = document.getElementsByTagName('link');
  for (let i = 0; i < linkTags.length; ++i) {
    const tag = linkTags[i];
    if (tag.href.indexOf('default.css') >= 0 ||
      tag.href.indexOf('dark.css') >= 0) {
      tag.parentElement.removeChild(tag);
    }
  }
}

QUnit.tearDown = tearDown;

QUnit.test(
  'when dark theme is set, dark theme is applied',
  async function (assert) {

    const done = assert.async();

    mockSettings({ schema: '2.0.0', theme: 'dark', swapDisplays: false });
    mockPanelData();
    await initDiscoverPage();

    const linkTags = document.getElementsByTagName('link');

    setTimeout(() => {

      assert.ok(
        collectionContains(linkTags, e => e.href.indexOf('dark.css') >= 0),
        'dark.css file should be present');
      assert.notOk(
        collectionContains(linkTags, e => e.href.indexOf('default.css') >= 0),
        'default.css file should not be present');

      done();
    }, TIMEOUT);

    tearDown();
  }
);

QUnit.test(
  'when default theme is set, default theme is applied',
  async function (assert) {

    const done = assert.async();

    mockSettings();
    mockPanelData();
    await initDiscoverPage();

    const linkTags = document.getElementsByTagName('link');

    setTimeout(() => {
      assert.ok(
        collectionContains(linkTags, e => e.href.indexOf('default.css') >= 0),
        'default.css file should be present');
      assert.notOk(
        collectionContains(linkTags, e => e.href.indexOf('dark.css') >= 0),
        'dark.css file should not be present');

      done();
    }, TIMEOUT);

    tearDown();
  }
);

QUnit.test(
  'when no feeds detected, no feeds notification displayed',
  async function (assert) {

    const done = assert.async();

    mockSettings();
    mockPanelData([]);
    await initDiscoverPage();

    setTimeout(() => {

      assert.equal(
        document.getElementById('discovered-feeds-list').innerHTML,
        'No feeds detected.',
        'no feeds detected message should be dislayed');

      done();
    }, TIMEOUT);

    tearDown();


  }
);

QUnit.test(
  'when feeds detected, feeds list displayed',
  async function (assert) {
    const done = assert.async();

    mockSettings();
    mockPanelData();
    await initDiscoverPage();

    const listItems = document
      .getElementById('discovered-feeds-list')
      .getElementsByTagName('li');

    setTimeout(() => {
      assert.equal(listItems[0].dataset.href, 'https://feed1.com');
      assert.equal(listItems[0].innerText, 'Feed 1');
      assert.equal(listItems[1].dataset.href, 'https://feed2.com');
      assert.equal(listItems[1].innerText, 'Feed 2');
      done();
    }, TIMEOUT);

    tearDown();
  }
);
