/* global QUnit
          Feed, DiscoveredFeeds, SettingsService, StorageService,
          bookmarkService, settingsService, storageService
*/

'use strict';

window.onload = null;

async function initDiscoverPage() {
  DiscoveredFeeds.init(storageService, bookmarkService, settingsService);
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
  async function(assert) {
    SettingsService.prototype.getTheme = async () => 'dark';
    await initDiscoverPage();
    const linkTags = document.getElementsByTagName('link');
    assert.ok(
      collectionContains(linkTags, e => e.href.indexOf('dark.css') >= 0),
      'dark.css file should be present');
    assert.notOk(
      collectionContains(linkTags, e => e.href.indexOf('default.css') >= 0),
      'default.css file should not be present');
    tearDown();
  }
);

QUnit.test(
  'when default theme is set, default theme is applied',
  async function(assert) {
    SettingsService.prototype.getTheme = async () => 'default';
    await initDiscoverPage();
    const linkTags = document.getElementsByTagName('link');
    assert.ok(
      collectionContains(linkTags, e => e.href.indexOf('default.css') >= 0),
      'default.css file should be present');
    assert.notOk(
      collectionContains(linkTags, e => e.href.indexOf('dark.css') >= 0),
      'dark.css file should not be present');
    tearDown();
  }
);

QUnit.test(
  'when no feeds detected, no feeds notification displayed',
  async function(assert) {
    StorageService.prototype.loadPanelData = async () => [];
    await initDiscoverPage();
    assert.equal(
      document.getElementById('discovered-feeds-list').innerHTML,
      'No feeds detected.',
      'no feeds detected message should be dislayed');
    tearDown();
  }
);

QUnit.test(
  'when feeds detected, feeds list displayed',
  async function(assert) {
    StorageService.prototype.loadPanelData = async () => [
      new Feed('Feed 1', 'https://feed1.com'),
      new Feed('Feed 2', 'https://feed2.com')];
    await initDiscoverPage();
    const listItems = document
      .getElementById('discovered-feeds-list')
      .getElementsByTagName('li');
    assert.equal(listItems[0].dataset.href, 'https://feed1.com');
    assert.equal(listItems[0].innerText, 'Feed 1');
    assert.equal(listItems[1].dataset.href, 'https://feed2.com');
    assert.equal(listItems[1].innerText, 'Feed 2');
    tearDown();
  }
);
