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
        const listNode = document.createElement('li');

        if (bookmark.url) {
          listNode.classList.add('feed-node');
          listNode.appendChild(
            this._buildFeedTitleSectionButton(bookmark, callbacks.onSelect));
          listNode.appendChild(
            this._buildControlSectionDiv(bookmark, callbacks.onDelete));
        } else if (bookmark.children) {
          const childList = document.createElement('ul');
          bookmark.children.forEach ((childBookmark) => {
            childList.appendChild(Formatting.Index.Bookmark.convertToNode(
              childBookmark, callbacks));
          });
          // TODO clean up feed folder display
          listNode.appendChild(this._buildFolderTitleSectionButton(bookmark));
          listNode.appendChild(this._buildControlSectionDiv(
            bookmark, callbacks.onDelete));
          listNode.appendChild(childList);
          listNode.classList.add('feed-folder-node');

          // See onclick defined in _buildFolderTitleSectionButton function
          const list = listNode.firstChild.nextSibling.nextSibling;
          list.style.display = 'none';
        }

        listNode.id = `b-${bookmark.id}`;
        return listNode;
      },

      _buildFeedTitleSectionButton(bookmark, onFeedSelected) {
        const button = document.createElement('button');
        button.type = 'button';
        button.id = `ui-select-${bookmark.id}`;
        button.classList.add('feed-title-container');
        button.setAttribute('aria-label', bookmark.title);
        button.appendChild(document.createTextNode(bookmark.title));

        if (onFeedSelected) {
          button.onclick = () => onFeedSelected(bookmark);
        }

        return button;
      },

      _buildFolderTitleSectionButton(bookmark) {
        const button = document.createElement('button');
        button.type = 'button';

        const icon = document.createElement('span');
        icon.classList.add('folder-indicator');
        icon.innerHTML = '+';
        button.appendChild(icon);

        button.id = `ui-select-${bookmark.id}`;
        button.setAttribute('aria-label', bookmark.title);
        button.classList.add('feed-title-container');
        button.classList.add('feed-folder-title');
        button.appendChild(document.createTextNode(bookmark.title));

        button.onclick = () =>  {
          // The button created by this function is the feed title section, its
          // first sibling is the control section and the second sibling is the
          // actual folder content
          const list = button.nextSibling.nextSibling;
          const isDisplayed = list.style.display !== 'none';
          list.style.display = isDisplayed ? 'none' : '';
          icon.innerHTML = isDisplayed ? '+' : '-';

        };

        return button;
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
        input.setAttribute('aria-label', `Delete ${bookmark.title}`)
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
      convertToNode(feed, onClick) {
        const listNode = document.createElement('li');
        listNode.dataset.href = feed.href;
        const button = document.createElement('button');
        button.type = 'button';
        button.onclick = onClick;
        button.classList.add('discovered-feed');
        button.setAttribute('aria-label', feed.title);

        button.appendChild(document.createTextNode(feed.title));
        listNode.appendChild(button);
        return listNode;
      }
    }
  }
};