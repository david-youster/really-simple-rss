/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import { getFeed } from './service/feeds.js';
import { createBookmark } from './service/bookmarks.js';

async function validateFeed(event) {
  event.preventDefault();

  const urlInput = document.getElementById('addfeed-url-input');
  const nameInput = document.getElementById('addfeed-name-input');

  nameInput.setCustomValidity('');
  urlInput.setCustomValidity('');

  let url = urlInput.value;
  try {
    new URL(url);
  } catch {
    // Shouldn't ever reach this
    urlInput.setCustomValidity('Invalid URL');
    urlInput.reportValidity();
    return false;
  }

  let feed;
  try {
    feed = await getFeed(url);
  } catch {
    urlInput.setCustomValidity('Unable to parse feed at URL');
    urlInput.reportValidity();
    return false;
  }
  if (feed === undefined) {
    urlInput.setCustomValidity('Unable to parse feed at URL');
    urlInput.reportValidity();
    return false;
  }

  await createBookmark({title: nameInput.value, href: url}, true);
  return true;
}

function clearError({target}) {
  target.setCustomValidity('');
}

function init() {
  const form = document.getElementById('add-feed-form');
  form.onsubmit = async (event) => await validateFeed(event);

  document.getElementById('addfeed-name-input').oninput = clearError;
  document.getElementById('addfeed-url-input').oninput = clearError;
}

window.onload = () => init();