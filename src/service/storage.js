'use strict';

function StorageService(webexService) {
  this.webex = webexService;
}

StorageService.prototype.loadPanelData = async function(key) {
  const panelData = await this.webex.load('panelData');
  return panelData[key];
};

StorageService.prototype.clearPanelData = async function(key) {
  const panelData = await this.webex.load('panelData');
  delete panelData[key];
  await this.webex.save(panelData);
};