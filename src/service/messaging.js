'use strict';

function MessagingService(webexService) {
  this.webex = webexService;
}

MessagingService.prototype.addListener = function(onMessageReceived) {
  this.webex.addListener(onMessageReceived);
};

MessagingService.prototype.requestRefresh = function() {
  this.webex.sendMessage('refresh');
};

