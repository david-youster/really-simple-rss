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

  // Clear all validation messages
  nameInput.setCustomValidity('');
  urlInput.setCustomValidity('');
  document.getElementById('feed-error').style.display = 'none';
  document.getElementById('url-error').style.display = 'none';

  let url = urlInput.value;
  try {
    new URL(url);
  } catch {
    // Shouldn't ever reach this
    document.getElementById('url-error').style.display = 'block';
    urlInput.setCustomValidity('Invalid URL');
    urlInput.reportValidity();
    return false;
  }

  let feed;
  try {
    feed = await getFeed(url);
  } catch {
    document.getElementById('feed-error').style.display = 'block';
    urlInput.setCustomValidity('Unable to parse feed at URL');
    urlInput.reportValidity();
    return false;
  }
  if (feed === undefined) {
    document.getElementById('feed-error').style.display = 'block';
    urlInput.setCustomValidity('Unable to parse feed at URL');
    urlInput.reportValidity();
    return false;
  }

  await createBookmark({title: nameInput.value, href: url}, true);
  document.getElementById('feed-added-message').style.display = 'block';
  resetForm();
  nameInput.value = '';
  urlInput.value = '';
  return true;
}

function clearError({target}) {
  target.setCustomValidity('');
}

function resetForm() {
  document.getElementById('feed-error').style.display = 'none';
  document.getElementById('url-error').style.display = 'none';
  document.getElementById('feed-added-message').style.display = 'none';
}

function init() {
  const form = document.getElementById('add-feed-form');
  form.onsubmit = async (event) => await validateFeed(event);

  document.getElementById('addfeed-name-input').oninput = clearError;
  document.getElementById('addfeed-url-input').oninput = clearError;

  document.getElementById('clear-button').onclick = resetForm;
}

window.onload = () => init();