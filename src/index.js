import Url from 'browser-url';
import mixinHtml5 from './html5.js';
import mixinHashbangWithHistoryApi from './hashbang-with-history-api.js';
import mixinHashbangOnly from './hashbang-only.js';

export default class {
  constructor({ mode, base = '/', onNavigate } = {}) {
    this.mode = mode;
    if (!this.mode) {
      this.mode = history.pushState && location.protocol.indexOf('http') == 0 ? 'html5' : 'hashbang';
    }

    let mixin;
    if (this.mode == 'html5') {
      mixin = mixinHtml5;
    } else if (history.pushState) {
      mixin = mixinHashbangWithHistoryApi;
    } else {
      mixin = mixinHashbangOnly;
    }

    for (let method in mixin) {
      this[method] = mixin[method];
    }

    this.base = base;
    this._baseNoTrailingSlash = base.replace(/\/$/, '');
    this.onNavigate = onNavigate;

    // fallback HTML5 URL to hashbang URL if browser doesn't support history API, and vise versa.
    this._convertLocation();

    // read data
    this._data = this._readData();

    // init data
    if (!this._data) {
      this._data = {
        current: null,
        sessions: []
      };
    }

    let [sessionId, id] = this._getCurrentSessionId();

    if (sessionId) {
      this._sessionId = Number(sessionId);
      this.items = this._data.sessions[this._sessionId];
      this.currentIndex = this.findIndexById(id);
      this.current = this.items[this.currentIndex];
    } else {
      this._sessionId = this._data.sessions.length;
      this.items = [];
      this._data.sessions.push(this.items);
      this.currentIndex = this.items.length;
      this.current = this._parseCurrentUrl();
      this._change('replace', this.current);
      this.items.push(this.current);
    }

    this.onNavigate(this.current);
  }

  push(...items) {
    if (this.currentIndex != this.items.length - 1) {
      this.items = this.items.slice(0, this.currentIndex + 1);
    }

    for (let item of items) {
      item = this._change('push', item);
      this.items.push(item);
    }

    this.currentIndex = this.items.length - 1;
    this.current = this.items[this.currentIndex];
    this._saveData();
    return this;
  }

  replace(item) {
    item = this._change('replace', item);
    this.current = this.items[this.currentIndex] = item;
    this._saveData();
    return this;
  }

  reset(...items) {
    return this.splice(0, this.items.length, ...items);
  }

  splice(start, deleteCount, ...insertItems) {
    let goSteps, index;
    let replaceFirst = false;

    if (start < 2) {
      goSteps = start - this.currentIndex * 2;
      index = 0;
      replaceFirst = true;
    } else {
      goSteps = start - this.currentIndex - 2;
      index = start - 2;
    }

    this._disableEvents();
    history.go(goSteps);

    this.items.splice(start, deleteCount, ...insertItems);

    for (; index < this.items.length; index++) {
      let item = this.items[index];
      if (replaceFirst) {
        item = this._change('replace', item);
        replaceFirst = false;
      } else {
        item = this._change('push', item);
      }
      this.items[index] = item;
    }

    if (this.items.length == 1) {
      let first = this.items[0];
      this._change('push', {
        id: 'PLACEHOLDER',
        path: first.path,
        query: first.query,
        hash: first.hash
      });

      history.back();
    }

    this.currentIndex = this.findIndexById(this.current.id);
    let lastIndex = this.items.length - 1;
    if (this.currentIndex == -1) {
      this.currentIndex = lastIndex;
    } else if (this.currentIndex != lastIndex) {
      history.go(this.currentIndex - lastIndex);
    }

    this.current = this.items[this.currentIndex];

    this._enableEvents();
    this._saveData();
    return this;
  }

  goto(location) {
    if (location) {
      this.push(location);
    }
    this._saveData();
    this._dispatchEvent();
    return this;
  }

  pop() {
    this.splice(this.items.length - 1, 1);
    return this;
  }

  go(n) {
    history.go(n);
    return this;
  }

  back() {
    return this.go(-1);
  }

  forward() {
    return this.go(1);
  }

  get(index) {
    return this.items[index];
  }

  findById(id) {
    return this.items.find((value) => {
      return value.id == id;
    });
  }

  findIndexById(id) {
    return this.items.findIndex((value) => {
      return value.id == id;
    });
  }

  findByPath(path) {
    return this.items.find((value) => {
      return value.path == path;
    });
  }

  findIndexByPath(path) {
    return this.items.findIndex((value) => {
      return value.path == path;
    });
  }

  findLastByPath(path) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (this.items[i].path == path) {
        return this.items[i];
      }
    }
  }

  findLastIndexByPath(path) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (this.items[i].path == path) {
        return i;
      }
    }
  }

  setState(state, index) {
    if (!index) {
      this.current.state = state;
    } else {
      this.items[index].state = state;
    }

    this._saveData();
    return this;
  }

  _parseCurrentUrl() {
    if (this.mode == 'html5') {
      return new Url();
    } else {
      return new Url(location.hash.slice(2) || '/');
    }
  }

  _change(method, item) {
    if (item.constructor == String) {
      item = { path: item };
    }

    if (!item.id) {
      item.id = Math.random().toString(16).slice(2);
    }

    let url = new Url(item.path).addQuery(item.query);

    if (item.hash) {
      url.hash = item.hash;
    }

    item.path = url.pathname;
    item.query = url.query;
    item.hash = url.hash;

    this._changeHistory(method, item, url);

    if (item.title) {
      document.title = item.title;
    }

    return item;
  }

  /*
  struct
  {
    current: { path, hid, state, query },
    sessions: [
      [
        { path, hid, state, query }
      ],

      [
        { path, hid, state, query }
      ]
    ]
  }
  */
  _saveData() {
    this._data.sessions[this._sessionId] = this.items;
    sessionStorage.setItem('_spaHistory', JSON.stringify(this._data));
    return this;
  }

  _readData() {
    return JSON.parse(sessionStorage.getItem('_spaHistory'));
  }

  _dispatchEvent() {

  }
}
