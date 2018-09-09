/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* exported Feeds */

'use strict';

const Feeds = {};

Feeds.selectFeedParser = function(xmlData) {
  return new Promise(function(resolve, reject) {
    if (xmlData.getElementsByTagName('rss').length > 0) {
      resolve({parse: Feeds.parseRss, xml: xmlData});
    }

    if (xmlData.getElementsByTagName('feed').length > 0) {
      resolve({parse: Feeds.parseAtom, xml: xmlData});
    }

    if (xmlData.getElementsByTagName('rdf:RDF').length > 0) {
      resolve({parse: Feeds.parseRdf, xml: xmlData});
    }

    reject();
  });
};

Feeds.parseRss = function*(xmlData) {
  let channel = xmlData.getElementsByTagName('channel')[0];
  for (let item of channel.getElementsByTagName('item')) {
    let title = item.getElementsByTagName('title')[0].childNodes[0].nodeValue;
    let link = item.getElementsByTagName('link')[0].childNodes[0].nodeValue;
    let summary = item.getElementsByTagName('description')[0]
      .childNodes[0].nodeValue;
    let listNode = document.createElement('li');
    listNode.appendChild(createAnchor(link, title, summary));
    yield listNode;
  }
};

Feeds.parseAtom = function*(xmlData) {
  let feed = xmlData.getElementsByTagName('feed')[0];
  for (let entry of feed.getElementsByTagName('entry')) {
    let title = entry.getElementsByTagName('title')[0]
      .childNodes[0].nodeValue;
    let url;
    for (let link of entry.getElementsByTagName('link')) {
      url = link.getAttribute('href');
    }
    let summaryElements = entry.getElementsByTagName('summary');
    let summary = '';
    if (summaryElements.length > 0) {
      if (summaryElements[0].childNodes.length > 0) {
        summary = summaryElements[0].childNodes[0].nodeValue;
      }
    }
    let listNode = document.createElement('li');
    listNode.appendChild(createAnchor(url, title, summary));
    yield listNode;
  }
};

Feeds.parseRdf = function*(xmlData) {
  let items = xmlData.getElementsByTagName('rdf:li');
  for (let item of items) {
    let listNode = document.createElement('li');
    let url = item.getAttribute('rdf:resource');
    listNode.appendChild(createAnchor(url, url));
    yield listNode;
  }
};

function createAnchor(href, text, title) {
  let maxTooltipLength = 400;
  let anchor = document.createElement('a');
  anchor.href = href;
  anchor.appendChild(document.createTextNode(text));
  if (title != undefined) {
    if (title.length > 512) {
      title = title.substring(0, maxTooltipLength) + '...';
    }
    anchor.title = title;
  }
  browser.history.search({text: href})
    .then((historyItems) => markAsRead(anchor, historyItems));
  return anchor;
}

function markAsRead(anchor, historyItems) {
  if (historyItems.length !== 0) {
    anchor.classList.add('old-article');
  } else {
    anchor.onclick = () => anchor.classList.add('old-article');
  }
}