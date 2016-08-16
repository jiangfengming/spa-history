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

    // get history id
    if (history.pushState) {
      // page is reloaded
      if (history.state) {
        let [sessionId, id] = history.state.id.split(':');
        this._sessionId = Number(sessionId);
        this.items = this._data.sessions[this._sessionId];
        this.current = this.findById(id).value;
        this.onNavigate(this.current);
      }
      // page is first loaded
      else {
        this._sessionId = this._data.sessions.length;
        this.items = [];
        this._data.sessions.push(this.items);
        let { pathname: path, query, hash } = this._parseCurrentUrl();
        let id = this._change('replace', path, query, hash);
        this.current = { id, path, query, hash };
        this.items.push(this.current);
        this.onNavigate(this.current);
      }
    } else {
      let url = new Url(location.hash.replace('#!', '') || '/');
      // page is reloaded
      if (url.query._hid) {

      }
      // page is first loaded
      else {

      }
    }

    this.length = 0;
    this.current = null;

    this._nativeLength = history.length;

    this.session = [];


    window.addEventListener('popstate', function(e) {
      // e.state
      console.log('popstate');
    });

    window.addEventListener('hashchange', function() {
      console.log('hashchange');
    });
  }

  push(...items) {
    let item;
    for (item of items) {
      item = this._change('push', item);
      this.items.push(item);
    }

    this.current = item;
    this._saveData();
    return this;
  }

  replace(item) {
    item = this._change('replace', item);
    let index = this.getCurrentIndex();
    this.current = this.items[index] = item;
    this._saveData();
    return this;
  }

  reset(...items) {
    this.splice(0, this.items.length, ...items);
    return this;
  }

  splice(start, deleteCount, ...insertItems) {

  }

  goto(location) {
    if (location) {
      this.push(location);
    }
    this._saveData();
    this._dispatchEvent();
  }

  pop() {
    history.back();
    let item = this.items.pop();
    this._saveData();
    return item;
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

  getCurrentIndex() {
    return this.findIndexById(this.current.id);
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

  _onNavigate() {
    let url = this._parseCurrentUrl();

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
    sessionStorage.setItem('_spaHistory', JSON.stringify(this._data));
  }

  _readData() {
    return JSON.parse(sessionStorage.getItem('_spaHistory'));
  }

  _dispatchEvent() {

  }
}
