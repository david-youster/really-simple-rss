/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

window.onload = onWindowLoaded;

function onWindowLoaded() {
  loadSettings();
  lookupElement('save-settings').onclick = saveSettings;
}

function loadSettings() {
  browser.storage.local.get('swapDisplays').then((result) =>
    lookupElement('swap-displays').checked = result.swapDisplays || false);
}

function saveSettings() {
  browser.storage.local
    .set({swapDisplays: lookupElement('swap-displays').checked})
    .then(displaySettingsUpdatedConfirmation);
}

function displaySettingsUpdatedConfirmation() {
  const body = document.getElementsByTagName('body')[0];
  body.appendChild(document.createTextNode('Settings saved.'));
  body.appendChild(document.createTextNode(
    ' You will need to re-open the sidebar for your changes to take effect.'));

}

function lookupElement(id) {
  return document.getElementById(id);
}