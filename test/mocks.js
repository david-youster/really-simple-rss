function WebExtensions() {}
WebExtensions.prototype.initBookmarks = function() {};
WebExtensions.prototype.loadBookmark = function() {};
WebExtensions.prototype.createBookmark = function() {};
WebExtensions.prototype.removeBookmark = async function() {};
WebExtensions.prototype.setBrowserAction = function() {};
WebExtensions.prototype.openSidebar = function() {};
WebExtensions.prototype.getCurrentTab = async function() {};
WebExtensions.prototype.discoverFeeds = async function() {};
WebExtensions.prototype.sendMessage = async function() {};
WebExtensions.prototype.addListener = function() {};
WebExtensions.prototype.createPanel = async function() {};
WebExtensions.prototype.save = async function() {};
WebExtensions.prototype.load = async function() {};

function BookmarkService() {}
BookmarkService.prototype.getFeedBookmarks = function() {};
BookmarkService.prototype.deleteBookmark = function() {};

function FeedService() {}
FeedService.prototype.getFeed = function() {};

function MessagingService() {}
MessagingService.prototype.addListener = function() {};

function SettingsService() {}
SettingsService.prototype.getTheme = async function() {};
SettingsService.prototype.isSwapDisplaysEnabled = async function() {};

function StorageService() {}
StorageService.prototype.loadPanelData = function() {};
StorageService.prototype.clearPanelData = function() {};
