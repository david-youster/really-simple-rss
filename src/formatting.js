/* exported Formatting */

'use strict';

const Formatting = {

  Index: {
    Bookmark: {
      /*
       * Convert a bookmark model object to its HTML list node representation.
       *
       * If the bookmark has a URL, a simple list node will be added.
       * If instead, it has an array of children, it will be treated as a
       * folder, and a list node containing a heading and sublist of bookmarks
       * will be created.
       *
       * @param bookmark - a Bookmark model object
       * @param callbacks - callbacks to be mapped to the created node
       * @param callbacks.onSelect - called when feed title is selected
       * @param callbacks.onDelete - called when delete button is clicked
       */
      convertToNode(bookmark, callbacks) {
        // TODO tidy this up

        const listNode = document.createElement('li');

        if (bookmark.url) {
          listNode.classList.add('feed-node');
          listNode.appendChild(
            this._buildFeedTitleSectionDiv(bookmark, callbacks.onSelect));
          listNode.appendChild(
            this._buildControlSectionDiv(bookmark, callbacks.onDelete));
        } else if (bookmark.children) {
          const childList = document.createElement('ul');
          bookmark.children.forEach ((childBookmark) => {
            childList.appendChild(Formatting.Index.Bookmark.convertToNode(
              childBookmark, callbacks));
          });
          // TODO clean up feed folder display
          listNode.appendChild(this._buildFolderTitleSectionDiv(bookmark));
          listNode.appendChild(this._buildControlSectionDiv(
            bookmark, callbacks.onDelete));
          listNode.appendChild(childList);
          listNode.classList.add('feed-folder-node');

          // Same list node as in _buildFolderTitleSectionDiv function
          // TODO find a nicer way to do this
          const list = listNode.firstChild.nextSibling.nextSibling;
          list.style.display = 'none';
        }

        listNode.id = `b-${bookmark.id}`;
        return listNode;
      },

      _buildFeedTitleSectionDiv(bookmark, onFeedSelected) {
        const div = document.createElement('div');
        div.id = `ui-select-${bookmark.id}`;
        div.classList.add('feed-title-container');
        div.appendChild(document.createTextNode(bookmark.title));

        if (onFeedSelected) {
          div.onclick = () => onFeedSelected(bookmark);
        }

        return div;
      },

      _buildFolderTitleSectionDiv(bookmark) {
        const div = document.createElement('div');

        const icon = document.createElement('span');
        icon.classList.add('folder-indicator');
        icon.innerHTML = '+';
        div.appendChild(icon);

        div.id = `ui-select-${bookmark.id}`;
        div.classList.add('feed-title-container');
        div.classList.add('feed-folder-title');
        div.appendChild(document.createTextNode(bookmark.title));

        div.onclick = () =>  {
          // The div created by this function is the feed title section, its
          // first sibling is the control section and the second sibling is the
          // actual folder content
          const list = div.nextSibling.nextSibling;
          const isDisplayed = list.style.display !== 'none';
          list.style.display = isDisplayed ? 'none' : '';
          icon.innerHTML = isDisplayed ? '+' : '-';

        };

        return div;
      },

      _buildControlSectionDiv(bookmark, onFeedDeleted) {
        const div = document.createElement('div');
        div.classList.add('feed-control-container');

        if (onFeedDeleted &&
            !Array.isArray(bookmark.children) ||
            bookmark.children.length === 0) {

          const deleteButton = this._buildDeleteButton(
            bookmark, onFeedDeleted);
          div.appendChild(deleteButton);

        }

        return div;
      },

      _buildDeleteButton(bookmark, onFeedDeleted) {
        const input = document.createElement('input');
        input.id = `ui-delete-${bookmark.id}`;
        input.classList.add('ui-delete');
        input.type = 'image';
        input.src = 'images/light/delete.svg';
        input.style.height = '15px';
        input.dataset.bookmarkId = bookmark.id;
        input.onclick = () => onFeedDeleted(bookmark);
        return input;
      }
    },

    FeedItem: {

      convertToNode(feedItem) {
        const listNode = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.href = feedItem.link;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferer';
        anchor.appendChild(document.createTextNode(feedItem.title));
        listNode.appendChild(anchor);
        return listNode;
      }

    }
  },

  DiscoveredFeeds: {
    Feed: {
      convertToNode(feed) {
        const listNode = document.createElement('li');
        listNode.dataset.href = feed.href;
        listNode.appendChild(document.createTextNode(feed.title));
        return listNode;
      }
    }
  }
};