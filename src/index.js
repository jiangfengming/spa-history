import Url from 'browser-url';
import mixinHtml5 from './html5.js';
import mixinHashbangWithHistoryApi from './hashbang-with-history-api.js';
import mixinHashbangOnly from './hashbang-only.js';

export default class {
  constructor({ mode, base = '/', onNavigate, onHashChange } = {}) {
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
    this.onHashChange = onHashChange;

    // fallback HTML5 URL to hashbang URL if browser doesn't support history API, and vise versa.
    this._convertLocation();

    // read data
    this._data = this._readData();

    // init data
    if (!this._data) {
      this._data = {
        sessions: [],
        states: {}
      };
    }

    let itemId = this._getCurrentItemId();
    let sessionId, session;
    let itemIndex = -1;
    if (itemId) {
      sessionId = Number(itemId.split(':')[0]);
      session = this._data.sessions[sessionId];
      if (session) {
        itemIndex = session.findIndex((item) => {
          return item.id == itemId;
        });
      }
    }

    // new session
    if (itemIndex == -1) {
      this._sessionId = this._data.sessions.length;
      this._session = [];
      this._data.sessions.push(this._session);
      let item = this._parseCurrentLocation();
      item = this._change('replace', item);
      this._session.push(item);
      this._setCurrentItem(this._session.length - 1);
    } else {
      this._sessionId = sessionId;
      this._session = session;
      this._setCurrentItem(itemIndex);
    }

    this._saveData();
    this._registerEvent();
    this._dispatchEvent('navigate');
  }

  get length() {
    return this._session.length;
  }

  push(...items) {
    if (this.currentIndex != this._session.length - 1) {
      this._session = this._session.slice(0, this.currentIndex + 1);
    }

    for (let item of items) {
      item = this._change('push', item);
      this._session.push(item);
      if (item.state) {
        this.setStateById(item.state, item.id);
      }
    }

    this._setCurrentItem(this._session.length - 1);
    this._saveData();
    return this;
  }

  replace(item) {
    item = this._change('replace', item);
    this._session[this.currentIndex] = item;
    if (item.state) {
      this.setStateById(item.state, item.id);
    }
    this._setCurrentItem(this.currentIndex);
    this._saveData();
    return this;
  }

  reset(...items) {
    return this.splice(0, this._session.length, ...items);
  }

  splice(start, deleteCount, ...insertItems) {
    return new Promise((resolve) => {
      let originalLength = this._session.length;
      let goSteps, index;
      let replaceFirst = false;

      if (start < 2) {
        goSteps = 0 - this.currentIndex;
        index = 0;
        replaceFirst = true;
      } else {
        goSteps = start - this.currentIndex - 2;
        index = start - 2;
      }

      this._disableEvent();
      this.go(goSteps).then(() => {
        this._session.splice(start, deleteCount, ...insertItems);
        for (; index < this._session.length; index++) {
          let item = this._session[index];
          if (replaceFirst) {
            item = this._change('replace', item);
            replaceFirst = false;
          } else {
            item = this._change('push', item);
          }
          this._session[index] = item;
          if (item.state) {
            this.setStateById(item.state, item.id);
          }
        }

        let promise;

        if (this._session.length == 1 && originalLength > 1) {
          this._setCurrentItem(0);
          this._change('push', {
            id: 'PLACEHOLDER',
            path: this.current.path,
            query: this.current.query,
            hash: this.current.hash
          });

          promise = this.back();
        } else {
          let lastIndex = this._session.length - 1;
          let currentIndex = this.findIndexById(this.current.id);
          if (currentIndex == -1) {
            currentIndex = lastIndex;
          } else if (currentIndex != lastIndex) {
            promise = this.go(currentIndex - lastIndex);
          }

          this._setCurrentItem(currentIndex);
          this._saveData();
        }

        Promise.resolve(promise).then(() => {
          this._enableEvent();
          resolve();
        });
      });
    });
  }

  goto(location) {
    let url = this._createUrl(location);
    let currentUrl = this._createUrl(this.current);

    // different location
    if (url.pathname + url.search != currentUrl.pathname + currentUrl.search) {
      this.push(location);
      this._dispatchEvent('navigate');
    }
    // same location
    else {
      // hash changed
      if (url.hash != currentUrl.hash) {
        location = this._format(location);
        location.id = this._getStateId(this.current.id) + ':' + this._uniqueId();
        this.push(location);
        this._dispatchEvent('hashChange');
      }
      // nothing changed, and no hash present
      else if (!currentUrl.hash) {
        this._dispatchEvent('navigate');
      }
    }
    return this;
  }

  reload() {
    this._dispatchEvent('navigate');
    return this;
  }

  pop() {
    this.splice(this._session.length - 1, 1);
    return this;
  }

  go(n) {
    if (n == 0) {
      return Promise.resolve();
    } else {
      return new Promise((resolve) => {
        history.go(n);
        this._goResolve = resolve;
      });
    }
  }

  back() {
    return this.go(-1);
  }

  forward() {
    return this.go(1);
  }

  get(index) {
    item = this._session[index];
    if (!item) {
      return null;
    }

    let item = Object.assign({}, item); // copy
    let stateId = this._getStateId(item.id);
    item.state = this._data.states[stateId];
    return item;
  }

  getAll() {
    return this._session.map((v, i) => {
      return this.get(i);
    });
  }

  findById(id) {
    return this.get(this.findIndexById(id));
  }

  findIndexById(id) {
    return this._session.findIndex((value) => {
      return value.id == id;
    });
  }

  findByPath(path) {
    return this.get(this.findIndexByPath(path));
  }

  findIndexByPath(path) {
    return this._session.findIndex((item) => {
      return item.path == path;
    });
  }

  findLastByPath(path) {
    return this.get(this.findLastIndexByPath(path));
  }

  findLastIndexByPath(path) {
    for (let i = this._session.length - 1; i >= 0; i--) {
      if (this._session[i].path == path) {
        return i;
      }
    }
  }

  setState(state, index) {
    let id = index ? this._session[index].id : null;
    return this.setStateById(state, id);
  }

  setStateById(state, id) {
    if (!id) {
      id = this.current.id;
    }

    let stateId = this._getStateId(id);
    this._data.states[stateId] = state;
    if (id == this.current.id) {
      this.current.state = state;
    }
    this._saveData();
    return this;
  }

  _getStateId(id) {
    let _id = id.split(':');
    return _id.length == 2 ? id : _id[0] + ':' + _id[1];
  }

  _setCurrentItem(index) {
    this.currentIndex = index;
    this.current = this.get(index);
  }

  _change(method, item) {
    item = this._format(item);
    let url = this._createUrl(item);

    if (!item.id) {
      item.id = this._sessionId + ':' + this._uniqueId();
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

  _format(item) {
    if (item.constructor == String) {
      item = {
        path: item
      };
    } else {
      item = Object.assign({}, item); // copy
    }

    return item;
  }

  _createUrl(loc) {
    if (loc.constructor == String) {
      return new Url(loc).sortQuery();
    } else {
      let url = new Url(loc.path).addQuery(loc.query).sortQuery();

      if (loc.hash) {
        url.hash = loc.hash;
      }

      return url;
    }
  }

  _uniqueId() {
    return Math.random().toString(16).slice(2);
  }

  /*
  {
    sessions: [
      [
        { id, path, query, hash }, ...
      ],
      ...
    ],

    states: {
      id: { },
      ...
    }
  }
  */
  _saveData() {
    // optimize for multiple calls in a short period
    if (!this._saveDataTimer) {
      this._saveDataTimer = setTimeout(() => {
        this._saveDataTimer = null;
        this._data.sessions[this._sessionId] = this._session;
        sessionStorage.setItem('_spaHistory', JSON.stringify(this._data));
      }, 100);
    }
  }

  _readData() {
    return JSON.parse(sessionStorage.getItem('_spaHistory'));
  }

  _dispatchEvent(name) {
    if (name == 'navigate') {
      this.onNavigate(this.current);
    } else if (name == 'hashChange') {
      this.onHashChange && this.onHashChange(this.current.hash);
    }
  }

  _disableEvent() {
    this._eventDisabled = true;
  }

  _enableEvent() {
    this._eventDisabled = false;
  }

  _onNavigate() {
    if (this._goResolve) {
      this._goResolve();
      this._goResolve = null;
    }

    if (!this._eventDisabled) {
      let id = this._getCurrentItemId();
      if (id == 'PLACEHOLDER') {
        this._disableEvent();
        this.back().then(() => {
          this._enableEvent();
        });
      } else {
        this._setCurrentItem(this.findIndexById(id));
        this._dispatchEvent('navigate');
      }
    }
  }
}
