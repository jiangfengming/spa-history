import Url from 'browser-url';
import mixinHtml5 from './html5';
import mixinHashbangWithHistoryApi from './hashbang-with-history-api';
import mixinHashbangOnly from './hashbang-only';

export default class {
  constructor({ mode, base = '/', beforeNavigate, onNavigate, onHashChange } = {}) {
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

    if (base.slice(-1) != '/') {
      this.base = base + '/';
      this._baseNoTrailingSlash = base;
    } else {
      this.base = base;
      this._baseNoTrailingSlash = base.replace(/\/$/, '');
    }

    this.beforeNavigate = beforeNavigate;
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

    let locationId = this._getCurrentId();
    let sessionId, session;
    let locationIndex = -1;
    if (locationId) {
      sessionId = Number(locationId.split('-')[0]);
      session = this._data.sessions[sessionId];
      if (session) {
        locationIndex = session.findIndex(location => {
          return location.id == locationId;
        });
      }
    }

    let promise;
    // new session
    if (locationIndex == -1) {
      this._sessionId = this._data.sessions.length;
      this._session = [];
      this._data.sessions.push(this._session);
      let url = this._parseUrl();
      this._setSession(url);
      this._setCurrentItem(this._session.length - 1);
      promise = this._change('replace', url);
    } else {
      this._sessionId = sessionId;
      this._session = session;
      this._setCurrentItem(locationIndex);
    }

    Promise.resolve(promise).then(() => {
      this._saveData();
      this._registerEvent();
      this._hookAClick();
      this._dispatchEvent('onNavigate', this.current, false);
    });
  }

  get length() {
    return this._session.length;
  }

  push(...locations) {
    if (this._cursor != this._session.length - 1) {
      this._session = this._session.slice(0, this._cursor + 1);
    }

    let promise = Promise.resolve();
    locations.forEach(location => {
      let url = this._locationToUrl(location);
      this._setSession(url);
      promise = promise.then(() => {
        return this._change('push', url);
      });
    });

    return promise.then(() => {
      this._setCurrentItem(this._session.length - 1);
      this._saveData();
    });
  }

  replace(location) {
    let url = this._locationToUrl(location);
    this._setSession(url, this._cursor);
    this._setCurrentItem(this._cursor);
    this._saveData();
    return this._change('replace', url);
  }

  reset(...locations) {
    return this.splice(0, this._session.length, ...locations);
  }

  splice(start, deleteCount, ...insertLocations) {
    return new Promise(resolve => {
      let originalLength = this._session.length;
      let steps, index, replaceFirst;

      if (start < 2) {
        replaceFirst = true;
        steps = 0 - this._cursor;
        index = 0;
      } else {
        replaceFirst = false;
        steps = start - this._cursor - 2;
        index = start - 1;
      }

      this._disableEvent();
      this.go(steps).then(() => {
        this._session.splice(start, deleteCount, ...insertLocations);

        let promise = Promise.resolve();

        let fn = index => {
          let url = this._locationToUrl(this._session[index]);
          this._setSession(url, index);
          promise = promise.then(() => {
            if (replaceFirst) {
              replaceFirst = false;
              return this._change('replace', url);
            } else {
              return this._change('push', url);
            }
          });
        };

        for (; index < this._session.length; index++) {
          fn(index);
        }

        promise.then(() => {
          let p;
          if (this._session.length == 1 && originalLength > 1) {
            this._setCurrentItem(0);
            p = this._change('push', this._locationToUrl({
              id: 'PLACEHOLDER',
              path: this.current.path,
              query: this.current.query,
              hash: this.current.hash
            })).then(() => {
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
    let to = this._locationToUrl(location);
    let current = this._locationToUrl(this.current);

    // different location
    if (to.pathname + to.search != current.pathname + current.search) {
      return this._dispatchEvent('beforeNavigate', this._urlToLocation(to), false).then((bool) => {
        if (bool != false) {
          return this.push(to).then(() => {
            return this._dispatchEvent('onNavigate', this.current, false);
          });
        }
      });
    }
    // same location
    else {
      if (to.hash) {
        // hash not changed
        if (to.hash == this.current.hash) {
          return Promise.resolve(false);
        }
        // hash changed
        else {
          to.id = this._getStateId(this.current.id) + '-' + this._uniqueId();
          return this.push(to).then(() => {
            return this._dispatchEvent('onHashChange', to.hash, current.hash);
          });
        }
      }
      // nothing changed, and no hash. reload
      else {
        return this._dispatchEvent('beforeNavigate', this._urlToLocation(to), true).then((bool) => {
          if (bool != false) {
            // current location has hash
            if (this.current.hash) {
              to.id = this._getStateId(this.current.id) + '-' + this._uniqueId();
              return this.push(to).then(() => {
                return this._dispatchEvent('onNavigate', this.current, true);
              });
            } else {
              return this._dispatchEvent('onNavigate', this.current, true);
            }
          }
        });
      }
    }
  }

  reload() {
    return this._dispatchEvent('onNavigate', this.current, true);
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
    let location = this._session[index];
    if (!location) {
      return null;
    }

    location = Object.assign({}, location); // copy
    let stateId = this._getStateId(location.id);
    location.state = this._data.states[stateId];
    return location;
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
    return this._session.findIndex(value => {
      return value.id == id;
    });
  }

  findByPath(path) {
    return this.get(this.findIndexByPath(path));
  }

  findIndexByPath(path) {
    return this._session.findIndex(location => {
      return location.path == path;
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

  setState(state, index, merge) {
    if (index == undefined) {
      return this.setStateById(state, null, merge);
    } else if (this._session[index]) {
      return this.setStateById(state, this._session[index].id, merge);
    } else {
      return false;
    }
  }

  setStateById(state, id, merge) {
    if (!id) {
      id = this.current.id;
    }

    let stateId = this._getStateId(id);

    if (merge) {
      state = Object.assign({}, this._data.states[stateId], state);
    }

    this._data.states[stateId] = state;
    if (id == this.current.id) {
      this.current.state = state;
    }
    this._saveData();
    return true;
  }

  mergeState(state, index) {
    return this.setState(state, index, true);
  }

  mergeStateById(state, id) {
    return this.setStateById(state, id, true);
  }

  _getStateId(id) {
    let _id = id.split('-');
    return _id.length == 2 ? id : _id[0] + '-' + _id[1];
  }

  _setCurrentItem(index) {
    this.currentIndex = index;

    if (index != -1) {
      this._cursor = index;
      this.current = this.get(index);
    } else {
      this._cursor = 0;
      this.current = this._urlToLocation(this._parseUrl());
      this.current.id = this._getCurrentId();
    }
  }

  _change(method, url) {
    return this._changeHistory(method, url).then(() => {
      if (url.title) {
        document.title = url.title;
      }
    });
  }

  _locationToUrl(location) {
    // already formatted
    if (location.pathname) {
      return location;
    }

    if (location.constructor == String) {
      return new Url(location).sortQuery();
    }

    let url = new Url(location.path).addQuery(location.query).sortQuery();
    if (location.hash) {
      url.hash = location.hash;
    }

    url.title = location.title;
    url.state = location.state;
    url.id = location.id;
    return url;
  }

  _urlToLocation(url) {
    return {
      id: url.id,
      path: url.pathname,
      query: url.query,
      hash: url.hash,
      state: url.state
    };
  }

  _uniqueId() {
    return Math.random().toString(16).slice(2, 8);
  }

  _setSession(url, index) {
    if (index == undefined) {
      index = this._session.length;
    }

    if (!url.id) {
      url.id = this._sessionId + '-' + this._uniqueId();
    }

    this._session[index] = {
      id: url.id,
      path: url.pathname,
      query: url.query,
      hash: url.hash
    };

    if (url.state != undefined) {
      this.setStateById(url.state, url.id);
    }
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
    this._data.sessions[this._sessionId] = this._session;
    sessionStorage.setItem('_spaHistory', JSON.stringify(this._data));
  }

  _readData() {
    return JSON.parse(sessionStorage.getItem('_spaHistory'));
  }

  // Invoking 'confirm()' during microtask execution is deprecated and will be removed in M53, around September 2016. See https://www.chromestatus.com/features/5647113010544640 for more details.
  _dispatchEvent(name, ...args) {
    if (this[name]) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this[name](...args));
        });
      });
    } else {
      return Promise.resolve(true);
    }
  }

  _onNavigate() {
    let toId = this._getCurrentId();
    if (toId == 'PLACEHOLDER') {
      this._disableEvent();
      this.back().then(() => {
        this._enableEvent();
      });
    } else {
      let lastStateId = this._getStateId(this.current.id);
      let toStateId = this._getStateId(toId);
      let toIndex = this.findIndexById(toId);
      let to = this.get(toIndex);
      let current = this.current;
      if (lastStateId == toStateId) {
        this._setCurrentItem(toIndex);
        this._dispatchEvent('onHashChange', to.hash, current.hash);
      } else {
        this._disableEvent();
        let steps = toIndex - this.currentIndex;
        this.go(-steps).then(() => {
          this._dispatchEvent('beforeNavigate', to, false).then((bool) => {
            if (bool != false) {
              return this.go(steps).then(() => {
                this._enableEvent();
                this._setCurrentItem(toIndex);
                return this._dispatchEvent('onNavigate', this.current, false);
              });
            } else {
              this._enableEvent();
            }
          });
        });
      }
    }
  }

  _hookAClick() {
    document.body.addEventListener('click', e => {
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
      url = this._parseUrl(url.href);
      this.goto(url.href);
    });
  }
}
