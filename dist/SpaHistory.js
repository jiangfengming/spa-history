(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('browser-url')) :
	typeof define === 'function' && define.amd ? define(['browser-url'], factory) :
	(global.SpaHistory = factory(global.Url));
}(this, (function (Url) { 'use strict';

Url = 'default' in Url ? Url['default'] : Url;

var mixinHtml5 = {
  url: function url(location) {
    var url = this._locationToUrl(location);
    return this._baseNoTrailingSlash + url.pathname + url.search + url.hash;
  },
  _changeHistory: function _changeHistory(method, url) {
    history[method + 'State']({ id: url.id }, '', this._baseNoTrailingSlash + url.pathname + url.search + url.hash);
    return Promise.resolve();
  },
  _go: function _go(n) {
    if (!n) return Promise.resolve();

    var promise = new Promise(function (resolve) {
      var fn = function fn() {
        window.removeEventListener('popstate', fn);
        resolve();
      };
      window.addEventListener('popstate', fn);
    });
    history.go(n);
    return promise;
  },


  // convert hashbang URL to HTML5 URL
  _convertLocation: function _convertLocation() {
    if (location.hash.indexOf('#!') === 0) {
      var url = this._baseNoTrailingSlash + (location.hash.slice(2) || '/');
      url = new Url(url).removeQuery('_sid').href;
      history.replaceState(null, '', url);
    }
  },
  _getCurrentId: function _getCurrentId() {
    return history.state ? history.state.id : null;
  },
  _parseUrl: function _parseUrl(url) {
    url = new Url(url).sortQuery();
    url.pathname = url.pathname.replace(this._baseNoTrailingSlash, '');
    return url;
  },
  _registerEvent: function _registerEvent() {
    var _this = this;

    this._navigateEvent = function () {
      _this._onNavigate();
    };
    this._eventDisabled = true;
    this._enableEvent();
  },
  _enableEvent: function _enableEvent() {
    if (this._eventDisabled) {
      window.addEventListener('popstate', this._navigateEvent);
      this._eventDisabled = false;
    }
  },
  _disableEvent: function _disableEvent() {
    if (!this._eventDisabled) {
      window.removeEventListener('popstate', this._navigateEvent);
      this._eventDisabled = true;
    }
  }
};

var mixinHashbangWithHistoryApi = {
  url: function url(location) {
    var url = this._locationToUrl(location);
    return '#!' + url.pathname + url.search + url.hash;
  },
  _changeHistory: function _changeHistory(method, url) {
    history[method + 'State']({ id: url.id }, '', '#!' + url.pathname + url.search + url.hash);
    return Promise.resolve();
  },


  _go: mixinHtml5._go,

  _convertLocation: function _convertLocation() {
    // no need to fallback to hashbang URL if history API is available
  },
  _getCurrentId: function _getCurrentId() {
    return history.state ? history.state.id : null;
  },
  _parseUrl: function _parseUrl(url) {
    url = new Url(url);
    if (url.hash.indexOf('#!') === 0) {
      url = url.hash.slice(2);
    } else {
      url = '/';
    }

    return new Url(url).sortQuery();
  },


  _registerEvent: mixinHtml5._registerEvent,
  _enableEvent: mixinHtml5._enableEvent,
  _disableEvent: mixinHtml5._disableEvent
};

var mixinHashbangOnly = {
  url: mixinHashbangWithHistoryApi.url,

  _changeHistory: function _changeHistory(method, url) {
    var _this = this;

    var promise = new Promise(function (resolve) {
      var eventDisabled = _this._eventDisabled;
      _this._disableEvent();
      var fn = function fn() {
        window.removeEventListener('hashchange', fn);
        if (!eventDisabled) {
          _this._enableEvent();
        }
        resolve();
      };
      window.addEventListener('hashchange', fn);
    });

    url.addQuery('_sid', url.id);
    location[method === 'push' ? 'assign' : 'replace']('#!' + url.pathname + url.search + url.hash);
    url.removeQuery('_sid');

    return promise;
  },
  _go: function _go(n) {
    if (!n) {
      return Promise.resolve();
    }

    var promise = new Promise(function (resolve) {
      var fn = function fn() {
        window.removeEventListener('hashchange', fn);
        resolve();
      };
      window.addEventListener('hashchange', fn);
    });
    history.go(n);
    return promise;
  },


  // fallback to hashbang url if browser doesn't history API
  _convertLocation: function _convertLocation() {
    if (this.base && location.pathname !== this.base && location.protocol.indexOf('http') === 0) {
      var url = location.pathname.replace(this._baseNoTrailingSlash, '');
      url = this.base + '#!' + url + location.search + location.hash;
      location.replace(url);
      // stop executing
      throw new Error('redirect');
    }
  },
  _getCurrentId: function _getCurrentId() {
    var url = Reflect.apply(mixinHashbangWithHistoryApi._parseUrl, this);
    return url.query._sid;
  },
  _parseUrl: function _parseUrl(url) {
    url = Reflect.apply(mixinHashbangWithHistoryApi._parseUrl, this, [url]);
    url.removeQuery('_sid');
    return url;
  },
  _registerEvent: function _registerEvent() {
    var _this2 = this;

    this._navigateEvent = function () {
      _this2._onNavigate();
    };
    this._eventDisabled = true;
    this._enableEvent();
  },
  _enableEvent: function _enableEvent() {
    if (this._eventDisabled) {
      window.addEventListener('hashchange', this._navigateEvent);
      this._eventDisabled = false;
    }
  },
  _disableEvent: function _disableEvent() {
    if (!this._eventDisabled) {
      window.removeEventListener('hashchange', this._navigateEvent);
      this._eventDisabled = true;
    }
  }
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _class = function () {
  function _class() {
    var _this = this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        mode = _ref.mode,
        _ref$base = _ref.base,
        base = _ref$base === undefined ? '/' : _ref$base,
        beforeNavigate = _ref.beforeNavigate,
        onNavigate = _ref.onNavigate,
        onHashChange = _ref.onHashChange;

    classCallCheck(this, _class);

    this.mode = mode;
    if (!this.mode) {
      this.mode = history.pushState && location.protocol.indexOf('http') === 0 ? 'html5' : 'hashbang';
    }

    var mixin = void 0;
    if (this.mode === 'html5') {
      mixin = mixinHtml5;
    } else if (history.pushState) {
      mixin = mixinHashbangWithHistoryApi;
    } else {
      mixin = mixinHashbangOnly;
    }

    for (var method in mixin) {
      this[method] = mixin[method];
    }

    if (base.slice(-1) !== '/') {
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

    var locationId = this._getCurrentId();
    var sessionId = void 0,
        session = void 0;
    var locationIndex = -1;
    if (locationId) {
      sessionId = Number(locationId.split('-')[0]);
      session = this._data.sessions[sessionId];
      if (session) {
        locationIndex = session.findIndex(function (location) {
          return location.id === locationId;
        });
      }
    }

    var promise = void 0;
    // new session
    if (locationIndex === -1) {
      this._sessionId = this._data.sessions.length;
      this._session = [];
      this._data.sessions.push(this._session);
      var url = this._parseUrl();
      this._setSession(url);
      this._setCurrentItem(this._session.length - 1);
      promise = this._change('replace', url);
    } else {
      this._sessionId = sessionId;
      this._session = session;
      this._setCurrentItem(locationIndex);
    }

    Promise.resolve(promise).then(function () {
      _this._saveData();
      _this._registerEvent();
      _this._hookAClick();
      _this._dispatchEvent('onNavigate', _this.current, false);
    });
  }

  _class.prototype.push = function push() {
    var _this2 = this;

    if (this._cursor !== this._session.length - 1) {
      this._session = this._session.slice(0, this._cursor + 1);
    }

    var promise = Promise.resolve();

    for (var _len = arguments.length, locations = Array(_len), _key = 0; _key < _len; _key++) {
      locations[_key] = arguments[_key];
    }

    locations.forEach(function (location) {
      var url = _this2._locationToUrl(location);
      _this2._setSession(url);
      promise = promise.then(function () {
        return _this2._change('push', url);
      });
    });

    return promise.then(function () {
      _this2._setCurrentItem(_this2._session.length - 1);
      _this2._saveData();
    });
  };

  _class.prototype.replace = function replace(location) {
    var url = this._locationToUrl(location);
    this._setSession(url, this._cursor);
    this._setCurrentItem(this._cursor);
    this._saveData();
    return this._change('replace', url);
  };

  _class.prototype.reset = function reset() {
    for (var _len2 = arguments.length, locations = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      locations[_key2] = arguments[_key2];
    }

    return this.splice.apply(this, [0, this._session.length].concat(locations));
  };

  _class.prototype.splice = function splice(start, deleteCount) {
    for (var _len3 = arguments.length, insertLocations = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
      insertLocations[_key3 - 2] = arguments[_key3];
    }

    var _this3 = this;

    return new Promise(function (resolve) {
      var originalLength = _this3._session.length;
      var steps = void 0,
          index = void 0,
          replaceFirst = void 0;

      if (start < 2) {
        replaceFirst = true;
        steps = 0 - _this3._cursor;
        index = 0;
      } else {
        replaceFirst = false;
        steps = start - _this3._cursor - 2;
        index = start - 1;
      }

      _this3._disableEvent();
      _this3.go(steps).then(function () {
        var _session;

        (_session = _this3._session).splice.apply(_session, [start, deleteCount].concat(insertLocations));

        var promise = Promise.resolve();

        var fn = function fn(index) {
          var url = _this3._locationToUrl(_this3._session[index]);
          _this3._setSession(url, index);
          promise = promise.then(function () {
            if (replaceFirst) {
              replaceFirst = false;
              return _this3._change('replace', url);
            } else {
              return _this3._change('push', url);
            }
          });
        };

        for (; index < _this3._session.length; index++) {
          fn(index);
        }

        promise.then(function () {
          var p = void 0;
          if (_this3._session.length === 1 && originalLength > 1) {
            _this3._setCurrentItem(0);
            p = _this3._change('push', _this3._locationToUrl({
              id: 'PLACEHOLDER',
              path: _this3.current.path,
              query: _this3.current.query,
              hash: _this3.current.hash
            })).then(function () {
              return _this3.back();
            });
          } else {
            var lastIndex = _this3._session.length - 1;
            var currentIndex = _this3.findIndexById(_this3.current.id);
            if (currentIndex === -1) {
              currentIndex = lastIndex;
            } else if (currentIndex !== lastIndex) {
              p = _this3.go(currentIndex - lastIndex);
            }

            _this3._setCurrentItem(currentIndex);
            _this3._saveData();
          }

          Promise.resolve(p).then(function () {
            _this3._enableEvent();
            resolve();
          });
        });
      });
    });
  };

  _class.prototype.goto = function goto(location) {
    var _this4 = this;

    var to = this._locationToUrl(location);
    var current = this._locationToUrl(this.current);

    if (to.pathname + to.search !== current.pathname + current.search) {
      // different location
      return this._dispatchEvent('beforeNavigate', this._urlToLocation(to), false).then(function (bool) {
        if (bool !== false) {
          return _this4.push(to).then(function () {
            return _this4._dispatchEvent('onNavigate', _this4.current, false);
          });
        }
      });
    } else {
      // same location
      if (to.hash) {
        if (to.hash === this.current.hash) {
          // hash not changed
          return Promise.resolve(false);
        } else {
          // hash changed
          to.id = this._getStateId(this.current.id) + '-' + this._uniqueId();
          return this.push(to).then(function () {
            return _this4._dispatchEvent('onHashChange', to.hash, current.hash);
          });
        }
      } else {
        // nothing changed, and no hash. reload
        return this._dispatchEvent('beforeNavigate', this._urlToLocation(to), true).then(function (bool) {
          if (bool !== false) {
            if (_this4.current.hash) {
              // current location has hash
              to.id = _this4._getStateId(_this4.current.id) + '-' + _this4._uniqueId();
              return _this4.push(to).then(function () {
                return _this4._dispatchEvent('onNavigate', _this4.current, true);
              });
            } else {
              return _this4._dispatchEvent('onNavigate', _this4.current, true);
            }
          }
        });
      }
    }
  };

  _class.prototype.reload = function reload() {
    return this._dispatchEvent('onNavigate', this.current, true);
  };

  _class.prototype.pop = function pop() {
    return this.splice(this._session.length - 1, 1);
  };

  _class.prototype.go = function go(n) {
    return this._go(n);
  };

  _class.prototype.back = function back() {
    return this._go(-1);
  };

  _class.prototype.forward = function forward() {
    return this._go(1);
  };

  _class.prototype.get = function get$$1(index) {
    var location = this._session[index];
    if (!location) {
      return null;
    }

    location = Object.assign({}, location); // copy
    var stateId = this._getStateId(location.id);
    location.state = this._data.states[stateId];
    return location;
  };

  _class.prototype.getAll = function getAll() {
    var _this5 = this;

    return this._session.map(function (v, i) {
      return _this5.get(i);
    });
  };

  _class.prototype.findById = function findById(id) {
    return this.get(this.findIndexById(id));
  };

  _class.prototype.findIndexById = function findIndexById(id) {
    return this._session.findIndex(function (value) {
      return value.id === id;
    });
  };

  _class.prototype.findByPath = function findByPath(path) {
    return this.get(this.findIndexByPath(path));
  };

  _class.prototype.findIndexByPath = function findIndexByPath(path) {
    return this._session.findIndex(function (location) {
      return location.path === path;
    });
  };

  _class.prototype.findLastByPath = function findLastByPath(path) {
    return this.get(this.findLastIndexByPath(path));
  };

  _class.prototype.findLastIndexByPath = function findLastIndexByPath(path) {
    for (var i = this._session.length - 1; i >= 0; i--) {
      if (this._session[i].path === path) {
        return i;
      }
    }
  };

  _class.prototype.setState = function setState(state, index, merge) {
    if (index == null) {
      return this.setStateById(state, null, merge);
    } else if (this._session[index]) {
      return this.setStateById(state, this._session[index].id, merge);
    } else {
      return false;
    }
  };

  _class.prototype.setStateById = function setStateById(state, id, merge) {
    if (!id) {
      id = this.current.id;
    }

    var stateId = this._getStateId(id);

    if (merge) {
      state = Object.assign({}, this._data.states[stateId], state);
    }

    this._data.states[stateId] = state;
    if (id === this.current.id) {
      this.current.state = state;
    }
    this._saveData();
    return true;
  };

  _class.prototype.mergeState = function mergeState(state, index) {
    return this.setState(state, index, true);
  };

  _class.prototype.mergeStateById = function mergeStateById(state, id) {
    return this.setStateById(state, id, true);
  };

  _class.prototype._getStateId = function _getStateId(id) {
    var _id = id.split('-');
    return _id.length === 2 ? id : _id[0] + '-' + _id[1];
  };

  _class.prototype._setCurrentItem = function _setCurrentItem(index) {
    this.currentIndex = index;

    if (index !== -1) {
      this._cursor = index;
      this.current = this.get(index);
    } else {
      this._cursor = 0;
      this.current = this._urlToLocation(this._parseUrl());
      this.current.id = this._getCurrentId();
    }
  };

  _class.prototype._change = function _change(method, url) {
    return this._changeHistory(method, url).then(function () {
      if (url.title) {
        document.title = url.title;
      }
    });
  };

  _class.prototype._locationToUrl = function _locationToUrl(location) {
    // already formatted
    if (location.pathname) {
      return location;
    }

    if (location.constructor === String) {
      return new Url(location).sortQuery();
    }

    var url = new Url(location.path).addQuery(location.query).sortQuery();
    if (location.hash) {
      url.hash = location.hash;
    }

    url.title = location.title;
    url.state = location.state;
    url.id = location.id;
    return url;
  };

  _class.prototype._urlToLocation = function _urlToLocation(url) {
    return {
      id: url.id,
      path: url.pathname,
      query: url.query,
      hash: url.hash,
      state: url.state
    };
  };

  _class.prototype._uniqueId = function _uniqueId() {
    return Math.random().toString(16).slice(2, 8);
  };

  _class.prototype._setSession = function _setSession(url, index) {
    if (index == null) {
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

    if (url.state != null) {
      this.setStateById(url.state, url.id);
    }
  };

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


  _class.prototype._saveData = function _saveData() {
    this._data.sessions[this._sessionId] = this._session;
    sessionStorage.setItem('_spaHistory', JSON.stringify(this._data));
  };

  _class.prototype._readData = function _readData() {
    return JSON.parse(sessionStorage.getItem('_spaHistory'));
  };

  // Invoking 'confirm()' during microtask execution is deprecated and will be removed in M53, around September 2016. See https://www.chromestatus.com/features/5647113010544640 for more details.


  _class.prototype._dispatchEvent = function _dispatchEvent(name) {
    var _this6 = this;

    for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      args[_key4 - 1] = arguments[_key4];
    }

    if (this[name]) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(_this6[name].apply(_this6, args));
        });
      });
    } else {
      return Promise.resolve(true);
    }
  };

  _class.prototype._onNavigate = function _onNavigate() {
    var _this7 = this;

    var toId = this._getCurrentId();
    if (toId === 'PLACEHOLDER') {
      this._disableEvent();
      this.back().then(function () {
        _this7._enableEvent();
      });
    } else {
      var lastStateId = this._getStateId(this.current.id);
      var toStateId = this._getStateId(toId);
      var toIndex = this.findIndexById(toId);
      var to = this.get(toIndex);
      var current = this.current;
      if (lastStateId === toStateId) {
        this._setCurrentItem(toIndex);
        this._dispatchEvent('onHashChange', to.hash, current.hash);
      } else {
        this._disableEvent();
        var steps = toIndex - this.currentIndex;
        this.go(-steps).then(function () {
          _this7._dispatchEvent('beforeNavigate', to, false).then(function (bool) {
            if (bool !== false) {
              return _this7.go(steps).then(function () {
                _this7._enableEvent();
                _this7._setCurrentItem(toIndex);
                return _this7._dispatchEvent('onNavigate', _this7.current, false);
              });
            } else {
              _this7._enableEvent();
            }
          });
        });
      }
    }
  };

  _class.prototype._hookAClick = function _hookAClick() {
    var _this8 = this;

    document.body.addEventListener('click', function (e) {
      var a = e.target.closest('a');

      if (!a || a.getAttribute('spa-history-skip') != null) {
        return;
      }

      var url = new Url(a.href);
      var base = new Url(_this8.base);
      if (url.href.indexOf(base.href) !== 0) {
        return;
      }

      var target = a.getAttribute('target');
      if (target && (target === '_blank' || target === '_parent' && window.parent !== window || target === '_top' && window.top !== window || !(target in { _self: 1, _blank: 1, _parent: 1, _top: 1 }) && target !== window.name)) {
        return;
      }

      e.preventDefault();
      url = _this8._parseUrl(url.href);
      _this8.goto(url.href);
    });
  };

  createClass(_class, [{
    key: 'length',
    get: function get$$1() {
      return this._session.length;
    }
  }]);
  return _class;
}();

return _class;

})));
