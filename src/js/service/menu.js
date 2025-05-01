/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

'use strict';

import { WebExtensions as wx } from './webex.js';

const Menu = {};

Menu.init = async function () {
    wx.addMenuShownListener(this._onShown);
    wx.addMenuItemClickListener(this._onClicked);
    wx.addMenuHiddenListener(this._onHidden);
};

Menu._onShown = function (info) {
    if (info.targetElementId === undefined) {
        return;
    }
    const element = wx.getTargetElement(info.targetElementId);
    if (element.classList.contains('feed-title-container') && element.dataset.homepage !== undefined) {
        const url = element.dataset.homepage;
        wx.addMenuItem('goto-feed-homepage' + url, `Go to ${url}`)
    }
};

Menu._onHidden = async function () {
    await wx.removeAllMenuItems();
};

Menu._onClicked = async function (info) {
    if (info.targetElementId === undefined) {
        return
    }
    const element = wx.getTargetElement(info.targetElementId);
    if (element.classList.contains('feed-title-container') && element.dataset.homepage !== undefined) {
        const url = element.dataset.homepage;
        await wx.newTab(url, true);
    }
};

export { Menu };