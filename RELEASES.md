# Changelog

## 1.0

- Initial release.

## 1.1

- Fix broken Atom parsing
- Display message when no feed is detected on page
- Display message when feed contains no items
- Display loading message when feed is selected

## 1.2

- Fix bug that broke feed discovery when multiple browser windows were open
- Highlight selected feed
- Display feed item summary in tooltip
- Implement very basic RDF feed parsing

## 1.3

- Fix Atom feed parsing

## 1.4

- Distinguish between read and unread articles
- Prompt before deleting a feed from bookmarks
- Fix Atom parsing when no 'rel' attribute is present
- Fixed homepage URL in manifest file

## 1.5

- Fix browser hanging on history lookup
- Styling tweaks

## 1.6
- Implement option to swap postion of feeds list panel and feed content panel

## 1.7
- Implement custom delete feed dialog box

## 1.8
- Fix RSS parsing when no item description is present
- Fix duplicated settings saved confirmation message

## 1.9
- Implement basic dark theme
- Fix broken feed deletion when delete window closed via window close button

## 2.0.0
- Rename to RSS Sidebar
- Support feed folders
- New icon set
- Remove 'confirm delete' popup. Replace with undo/confirm options in control bar
- Refresh sidebar on settings change
- Remove 'history', 'tabs' and 'activeTab' permissions

## 2.0.1
- Display delete icon on folders when all feeds contained within have been deleted
- Don't clear feed display section when settings are updated
- Don't clear feed display section when new feed is added
- Keep folders' expanded/collapsed state when new feed is added or settings are updated
