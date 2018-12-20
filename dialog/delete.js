/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

window.onload = onWindowLoaded;

function onWindowLoaded() {
  document.getElementById('confirm-button').onclick = onConfirm;
  document.getElementById('cancel-button').onclick = onCancel;
}

function onConfirm() {
  browser.runtime.sendMessage({action: 'delete'});
  window.close();

}

function onCancel() {
  browser.storage.local.remove('deleteId');
  window.close();
}