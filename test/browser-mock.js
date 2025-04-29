const browser = {
  bookmarks: {

    _bookmarks: [],
    _nextId: 0,

    async create() {
      const arg = arguments[0];
      const createdBookmark = {
        id: this._nextId++,
        title: arg.title,
        type: arg.url ? 'bookmark' : 'folder',
        index: arg.index ? arg.index : 0
      };

      browser.bookmarks._bookmarks.push(createdBookmark);

      return createdBookmark;
    },

    async search() {
      const query = arguments[0].title;
      return browser.bookmarks._findByTitle(
        browser.bookmarks._bookmarks[0], query);
    },

    _findByTitle(bookmark, title) {
      if (bookmark.title === title) {
        return [bookmark];
      }


      if (bookmark.children) {

        let result = null;
        for (let i = 0; result == null && i < bookmark.children.length; ++i) {
          result = browser.bookmarks._findByTitle(bookmark.children[i], title);
        }
        return [result];
      }

      return [];
    },

    async getSubTree() {
      const id = arguments[0];
      return browser.bookmarks._bookmarks.filter(b => b.id === id);
    },

    remove() {
      return Promise.resolve();
    }
  },

  browserAction: {
    onClicked: {
      async addListener() { }
    }
  },

  sidebarAction: {
    async open() { }
  },

  windows: {
    _windows: [],

    async getCurrent() {
      return null;
    },

    async create() {
      return null;
    }
  },

  tabs: {
    query() {
      return new Promise();
    },

    sendMessage() {
      return new Promise();
    }
  },

  runtime: {
    sendMessage() {
      return new Promise();
    },

    onMessage: {
      addListener() { }
    }
  },

  extension: {
    _url: '',

    getURL() {
      return this._url;
    }
  },

  storage: {
    local: {
      _data: {},

      set() {
        const key = arguments[0];
        const value = arguments[1];
        this._data[key] = value;
        return Promise.resolve();
      },

      get() {
        const key = arguments[0];
        return Promise.resolve({ [key]: this._data[key] });
      }
    }
  }

};