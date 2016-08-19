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

    let promise;
    // new session
    if (itemIndex == -1) {
      this._sessionId = this._data.sessions.length;
      this._session = [];
      this._data.sessions.push(this._session);
      let item = this._parseCurrentLocation();
      promise = this._change('replace', item).then((item) => {
        this._session.push(item);
        this._setCurrentItem(this._session.length - 1);
      });
    } else {
      this._sessionId = sessionId;
      this._session = session;
      this._setCurrentItem(itemIndex);
    }

    Promise.resolve(promise).then(() => {
      this._saveData();
      this._registerEvent();
      this._hookAClick();
      this._dispatchEvent('navigate');
    });
  }

  get length() {
    return this._session.length;
  }

  push(...items) {
    if (this._cursor != this._session.length - 1) {
      this._session = this._session.slice(0, this._cursor + 1);
    }

    let promise = Promise.resolve();
    items.forEach((item) => {
      promise = promise.then(() => {
        return this._change('push', item).then((item) => {
          this._session.push(item);
          if (item.state) {
            this.setStateById(item.state, item.id);
          }
        });
      });
    });

    return promise.then(() => {
      this._setCurrentItem(this._session.length - 1);
      this._saveData();
    });
  }

  replace(item) {
    return this._change('replace', item).then((item) => {
      this._session[this._cursor] = item;
      if (item.state) {
        this.setStateById(item.state, item.id);
      }
      this._setCurrentItem(this._cursor);
      this._saveData();
    });
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
        goSteps = 0 - this._cursor;
        index = 0;
        replaceFirst = true;
      } else {
        goSteps = start - this._cursor - 2;
        index = start - 2;
      }

      this._disableEvent();
      this.go(goSteps).then(() => {
        this._session.splice(start, deleteCount, ...insertItems);

        let promise = Promise.resolve();

        let fn = (index) => {
          let item = this._session[index];
          let p;
          if (replaceFirst) {
            replaceFirst = false;
            p = this._change('replace', item);
          } else {
            p = this._change('push', item);
          }

          promise = promise.then(() => {
            return p.then((item) => {
              this._session[index] = item;
              if (item.state) {
                this.setStateById(item.state, item.id);
              }
            });
          });
        };

        for (; index < this._session.length; index++) {
          fn(index);
        }

        promise.then(() => {
          let p;
          if (this._session.length == 1 && originalLength > 1) {
            this._setCurrentItem(0);
            p = this._change('push', {
              id: 'PLACEHOLDER',
              path: this.current.path,
              query: this.current.query,
              hash: this.current.hash
            }).then(() => {
              return this.back();
            });
          } else {
            let lastIndex = this._session.length - 1;
            let currentIndex = this.findIndexById(this.current.id);
            if (currentIndex == -1) {
              currentIndex = lastIndex;
            } else if (currentIndex != lastIndex) {
              p = this.go(currentIndex - lastIndex);
            }

            this._setCurrentItem(currentIndex);
            this._saveData();
          }

          Promise.resolve(p).then(() => {
            this._enableEvent();
            resolve();
          });
        });
      });
    });
  }

  goto(location) {
    let url = this._createUrl(location);
    let currentUrl = this._createUrl(this.current);

    // different location
    if (url.pathname + url.search != currentUrl.pathname + currentUrl.search) {
      return this.push(location).then(() => {
        this._dispatchEvent('navigate');
      });
    }
    // same location
    else {
      // hash changed
      if (url.hash != currentUrl.hash) {
        location = this._format(location);
        location.id = this._getStateId(this.current.id) + ':' + this._uniqueId();
        return this.push(location).then(() => {
          this._dispatchEvent('hashChange');
        });
      }
      // nothing changed, and no hash present
      else if (!currentUrl.hash) {
        this._dispatchEvent('navigate');
      }

      return Promise.resolve();
    }
  }

  reload() {
    this._dispatchEvent('navigate');
    return this;
  }

  pop() {
    return this.splice(this._session.length - 1, 1);
  }

  go(n) {
    return this._go(n);
  }

  back() {
    return this._go(-1);
  }

  forward() {
    return this._go(1);
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
    let id = index && this._session[index] ? this._session[index].id : null;
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

    if (index != -1) {
      this._cursor = index;
      this.current = this.get(index);
    } else {
      this._cursor = 0;
      this.current = this._parseCurrentLocation();
      this.current.id = this._getCurrentItemId();
    }
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

    return this._changeHistory(method, item, url).then(() => {
      if (item.title) {
        document.title = item.title;
      }

      return item;
    });
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

  _onNavigate() {
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

  _hookAClick() {
    document.body.addEventListener('click', (e) => {
      let a = e.target.closest('a');

      if (!a || a.getAttribute('spa-history-skip') != null) {
        return;
      }

      let url = new Url(a.href);
      let base = new Url(this.base);
      if (url.href.indexOf(base.href) != 0) {
        return;
      }

      var target = a.getAttribute('target');
      if (target && (target == '_blank' || target == '_parent' && window.parent != window || target == '_top' && window.top != window || !(target in { _self: 1, _blank: 1, _parent: 1, _top: 1 }) && target != window.name)) {
        return;
      }

      e.preventDefault();
      this.goto(url.href);
    });
  }
}
