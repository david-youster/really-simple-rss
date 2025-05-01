/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import * as wx from './webex.js';
import { FeedItem } from '../model.js';


export async function detectFeeds() {
  const feeds = await wx.discoverFeeds();
  wx.createPanel('/html/discover.html', feeds);
};

export async function getFeed(url) {
  return _FeedParser.parse(await _requestFeed(url));
};

async function _requestFeed(url) {
  const response = await fetch(url, { method: 'GET', mode: 'cors' });
  if (response.status !== 200) {
    throw `Bad response from ${url}`;
  }
  return _parseResponseXml(await response.text());
};

function _parseResponseXml (text) {
  return (new window.DOMParser()).parseFromString(text, 'text/xml');
};

// TODO remove 'namespace' object
const _FeedParser = {};

_FeedParser.parse = function (xml) {
  if (this._rssDetected(xml)) {
    return this._parseRss(xml);
  }

  if (this._atomDetected(xml)) {
    return this._parseAtom(xml);
  }

  if (this._rdfDetected(xml)) {
    return this._parseRdf(xml);
  }
};

_FeedParser._rssDetected = function (xml) {
  return xml.getElementsByTagName('rss').length > 0;
};

_FeedParser._parseRss = function (xml) {
  const feeds = [];
  for (const item of xml.getElementsByTagName('item')) {
    const title = this._readNodeValue(item, 'title');
    const link = this._readNodeValue(item, 'link');
    const description = this._readNodeValue(item, 'description');
    feeds.push(new FeedItem(title, link, description));
  }
  return feeds;
};

_FeedParser._atomDetected = function (xml) {
  return xml.getElementsByTagName('feed').length > 0;
};

_FeedParser._parseAtom = function (xml) {
  const feeds = [];
  for (const item of xml.getElementsByTagName('entry')) {
    const title = this._readNodeValue(item, 'title');
    const link = item.getElementsByTagName('link')[0].getAttribute('href');
    const description = this._readNodeValue(item, 'summary');
    feeds.push(new FeedItem(title, link, description));
  }
  return feeds;
};

_FeedParser._rdfDetected = function (xml) {
  return xml.getElementsByTagName('rdf:RDF').length > 0;
};

_FeedParser._parseRdf = function (xml) {
  const feeds = [];
  for (const item of xml.getElementsByTagName('rdf:li')) {
    const link = item.getAttribute('rdf:resource');
    feeds.push(new FeedItem(link, link));
  }
  return feeds;
};

_FeedParser._readNodeValue = function (node, tag) {
  try {
    return node.getElementsByTagName(tag)[0].childNodes[0].nodeValue;
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    // TODO: Better error handling
    return '';
  }
};
