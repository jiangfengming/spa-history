(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("browser-url"));
	else if(typeof define === 'function' && define.amd)
		define(["browser-url"], factory);
	else if(typeof exports === 'object')
		exports["SpaHistory"] = factory(require("browser-url"));
	else
		root["SpaHistory"] = factory(root["browser-url"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _browserUrl = __webpack_require__(0);

var _browserUrl2 = _interopRequireDefault(_browserUrl);

var _html = __webpack_require__(2);

var _html2 = _interopRequireDefault(_html);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  url: function url(location) {
    var url = this._locationToUrl(location);
    return '#!' + url.pathname + url.search + url.hash;
  },
  _changeHistory: function _changeHistory(method, url) {
    history[method + 'State']({ id: url.id }, '', '#!' + url.pathname + url.search + url.hash);
    return Promise.resolve();
  },


  _go: _html2.default._go,

  // no need to fallback to hashbang URL if history API is available
  _convertLocation: function _convertLocation() {},
  _getCurrentId: function _getCurrentId() {
    return history.state ? history.state.id : null;
  },
  _parseUrl: function _parseUrl(url) {
    url = new _browserUrl2.default(url);
    if (url.hash.indexOf('#!') == 0) {
      url = url.hash.slice(2);
    } else {
      url = '/';
    }

    return new _browserUrl2.default(url).sortQuery();
  },


  _registerEvent: _html2.default._registerEvent,
  _enableEvent: _html2.default._enableEvent,
  _disableEvent: _html2.default._disableEvent
};
module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _browserUrl = __webpack_require__(0);

var _browserUrl2 = _interopRequireDefault(_browserUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  url: function url(location) {
    var url = this._locationToUrl(location);
    return this._baseNoTrailingSlash + url.pathname + url.search + url.hash;
  },
  _changeHistory: function _changeHistory(method, url) {
    history[method + 'State']({ id: url.id }, '', this._baseNoTrailingSlash + url.pathname + url.search + url.hash);
    return Promise.resolve();
  },
  _go: function _go(n) {
    if (!n) {
      return Promise.resolve();
    }

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
    if (location.hash.indexOf('#!') == 0) {
      var url = this._baseNoTrailingSlash + (location.hash.slice(2) || '/');
      url = new _browserUrl2.default(url).removeQuery('_sid').href;
      history.replaceState(null, '', url);
    }
  },
  _getCurrentId: function _getCurrentId() {
    return history.state ? history.state.id : null;
  },
  _parseUrl: function _parseUrl(url) {
    url = new _browserUrl2.default(url).sortQuery();
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
module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _hashbangWithHistoryApi = __webpack_require__(1);

var _hashbangWithHistoryApi2 = _interopRequireDefault(_hashbangWithHistoryApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  url: _hashbangWithHistoryApi2.default.url,

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
    location[method == 'push' ? 'assign' : 'replace']('#!' + url.pathname + url.search + url.hash);
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
    if (this.base && location.pathname != this.base && location.protocol.indexOf('http') == 0) {
      var url = location.pathname.replace(this._baseNoTrailingSlash, '');
      url = this.base + '#!' + url + location.search + location.hash;
      location.replace(url);
      // stop executing
      throw 1;
    }
  },
  _getCurrentId: function _getCurrentId() {
    var url = _hashbangWithHistoryApi2.default._parseUrl.call(this);
    return url.query._sid;
  },
  _parseUrl: function _parseUrl(url) {
    url = _hashbangWithHistoryApi2.default._parseUrl.call(this, url);
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
module.exports = exports['default'];

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _browserUrl = __webpack_require__(0);

var _browserUrl2 = _interopRequireDefault(_browserUrl);

var _html = __webpack_require__(2);

var _html2 = _interopRequireDefault(_html);

var _hashbangWithHistoryApi = __webpack_require__(1);

var _hashbangWithHistoryApi2 = _interopRequireDefault(_hashbangWithHistoryApi);

var _hashbangOnly = __webpack_require__(3);

var _hashbangOnly2 = _interopRequireDefault(_hashbangOnly);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class() {
    var _this = this;

    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var mode = _ref.mode;
    var _ref$base = _ref.base;
    var base = _ref$base === undefined ? '/' : _ref$base;
    var beforeNavigate = _ref.beforeNavigate;
    var onNavigate = _ref.onNavigate;
    var onHashChange = _ref.onHashChange;

    _classCallCheck(this, _class);

    this.mode = mode;
    if (!this.mode) {
      this.mode = history.pushState && location.protocol.indexOf('http') == 0 ? 'html5' : 'hashbang';
    }

    var mixin = void 0;
    if (this.mode == 'html5') {
      mixin = _html2.default;
    } else if (history.pushState) {
      mixin = _hashbangWithHistoryApi2.default;
    } else {
      mixin = _hashbangOnly2.default;
    }

    for (var method in mixin) {
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

    var locationId = this._getCurrentId();
    var sessionId = void 0,
        session = void 0;
    var locationIndex = -1;
    if (locationId) {
      sessionId = Number(locationId.split('-')[0]);
      session = this._data.sessions[sessionId];
      if (session) {
        locationIndex = session.findIndex(function (location) {
          return location.id == locationId;
        });
      }
    }

    var promise = void 0;
    // new session
    if (locationIndex == -1) {
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

  _createClass(_class, [{
    key: 'push',
    value: function push() {
      var _this2 = this;

      if (this._cursor != this._session.length - 1) {
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
    }
  }, {
    key: 'replace',
    value: function replace(location) {
      var url = this._locationToUrl(location);
      this._setSession(url, this._cursor);
      this._setCurrentItem(this._cursor);
      this._saveData();
      return this._change('replace', url);
    }
  }, {
    key: 'reset',
    value: function reset() {
      for (var _len2 = arguments.length, locations = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        locations[_key2] = arguments[_key2];
      }

      return this.splice.apply(this, [0, this._session.length].concat(locations));
    }
  }, {
    key: 'splice',
    value: function splice(start, deleteCount) {
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
            if (_this3._session.length == 1 && originalLength > 1) {
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
              if (currentIndex == -1) {
                currentIndex = lastIndex;
              } else if (currentIndex != lastIndex) {
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
    }
  }, {
    key: 'goto',
    value: function goto(location) {
      var _this4 = this;

      var to = this._locationToUrl(location);
      var current = this._locationToUrl(this.current);

      // different location
      if (to.pathname + to.search != current.pathname + current.search) {
        return this._dispatchEvent('beforeNavigate', this._urlToLocation(to), false).then(function (bool) {
          if (bool != false) {
            return _this4.push(to).then(function () {
              return _this4._dispatchEvent('onNavigate', _this4.current, false);
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
                return this.push(to).then(function () {
                  return _this4._dispatchEvent('onHashChange', to.hash, current.hash);
                });
              }
          }
          // nothing changed, and no hash. reload
          else {
              return this._dispatchEvent('beforeNavigate', this._urlToLocation(to), true).then(function (bool) {
                if (bool != false) {
                  // current location has hash
                  if (_this4.current.hash) {
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
    }
  }, {
    key: 'reload',
    value: function reload() {
      return this._dispatchEvent('onNavigate', this.current, true);
    }
  }, {
    key: 'pop',
    value: function pop() {
      return this.splice(this._session.length - 1, 1);
    }
  }, {
    key: 'go',
    value: function go(n) {
      return this._go(n);
    }
  }, {
    key: 'back',
    value: function back() {
      return this._go(-1);
    }
  }, {
    key: 'forward',
    value: function forward() {
      return this._go(1);
    }
  }, {
    key: 'get',
    value: function get(index) {
      var location = this._session[index];
      if (!location) {
        return null;
      }

      location = Object.assign({}, location); // copy
      var stateId = this._getStateId(location.id);
      location.state = this._data.states[stateId];
      return location;
    }
  }, {
    key: 'getAll',
    value: function getAll() {
      var _this5 = this;

      return this._session.map(function (v, i) {
        return _this5.get(i);
      });
    }
  }, {
    key: 'findById',
    value: function findById(id) {
      return this.get(this.findIndexById(id));
    }
  }, {
    key: 'findIndexById',
    value: function findIndexById(id) {
      return this._session.findIndex(function (value) {
        return value.id == id;
      });
    }
  }, {
    key: 'findByPath',
    value: function findByPath(path) {
      return this.get(this.findIndexByPath(path));
    }
  }, {
    key: 'findIndexByPath',
    value: function findIndexByPath(path) {
      return this._session.findIndex(function (location) {
        return location.path == path;
      });
    }
  }, {
    key: 'findLastByPath',
    value: function findLastByPath(path) {
      return this.get(this.findLastIndexByPath(path));
    }
  }, {
    key: 'findLastIndexByPath',
    value: function findLastIndexByPath(path) {
      for (var i = this._session.length - 1; i >= 0; i--) {
        if (this._session[i].path == path) {
          return i;
        }
      }
    }
  }, {
    key: 'setState',
    value: function setState(state, index, merge) {
      if (index == undefined) {
        return this.setStateById(state, null, merge);
      } else if (this._session[index]) {
        return this.setStateById(state, this._session[index].id, merge);
      } else {
        return false;
      }
    }
  }, {
    key: 'setStateById',
    value: function setStateById(state, id, merge) {
      if (!id) {
        id = this.current.id;
      }

      var stateId = this._getStateId(id);

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
  }, {
    key: 'mergeState',
    value: function mergeState(state, index) {
      return this.setState(state, index, true);
    }
  }, {
    key: 'mergeStateById',
    value: function mergeStateById(state, id) {
      return this.setStateById(state, id, true);
    }
  }, {
    key: '_getStateId',
    value: function _getStateId(id) {
      var _id = id.split('-');
      return _id.length == 2 ? id : _id[0] + '-' + _id[1];
    }
  }, {
    key: '_setCurrentItem',
    value: function _setCurrentItem(index) {
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
  }, {
    key: '_change',
    value: function _change(method, url) {
      return this._changeHistory(method, url).then(function () {
        if (url.title) {
          document.title = url.title;
        }
      });
    }
  }, {
    key: '_locationToUrl',
    value: function _locationToUrl(location) {
      // already formatted
      if (location.pathname) {
        return location;
      }

      if (location.constructor == String) {
        return new _browserUrl2.default(location).sortQuery();
      }

      var url = new _browserUrl2.default(location.path).addQuery(location.query).sortQuery();
      if (location.hash) {
        url.hash = location.hash;
      }

      url.title = location.title;
      url.state = location.state;
      url.id = location.id;
      return url;
    }
  }, {
    key: '_urlToLocation',
    value: function _urlToLocation(url) {
      return {
        id: url.id,
        path: url.pathname,
        query: url.query,
        hash: url.hash,
        state: url.state
      };
    }
  }, {
    key: '_uniqueId',
    value: function _uniqueId() {
      return Math.random().toString(16).slice(2, 8);
    }
  }, {
    key: '_setSession',
    value: function _setSession(url, index) {
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

  }, {
    key: '_saveData',
    value: function _saveData() {
      this._data.sessions[this._sessionId] = this._session;
      sessionStorage.setItem('_spaHistory', JSON.stringify(this._data));
    }
  }, {
    key: '_readData',
    value: function _readData() {
      return JSON.parse(sessionStorage.getItem('_spaHistory'));
    }

    // Invoking 'confirm()' during microtask execution is deprecated and will be removed in M53, around September 2016. See https://www.chromestatus.com/features/5647113010544640 for more details.

  }, {
    key: '_dispatchEvent',
    value: function _dispatchEvent(name) {
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
    }
  }, {
    key: '_onNavigate',
    value: function _onNavigate() {
      var _this7 = this;

      var toId = this._getCurrentId();
      if (toId == 'PLACEHOLDER') {
        this._disableEvent();
        this.back().then(function () {
          _this7._enableEvent();
        });
      } else {
        (function () {
          var lastStateId = _this7._getStateId(_this7.current.id);
          var toStateId = _this7._getStateId(toId);
          var toIndex = _this7.findIndexById(toId);
          var to = _this7.get(toIndex);
          var current = _this7.current;
          if (lastStateId == toStateId) {
            _this7._setCurrentItem(toIndex);
            _this7._dispatchEvent('onHashChange', to.hash, current.hash);
          } else {
            (function () {
              _this7._disableEvent();
              var steps = toIndex - _this7.currentIndex;
              _this7.go(-steps).then(function () {
                _this7._dispatchEvent('beforeNavigate', to, false).then(function (bool) {
                  if (bool != false) {
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
            })();
          }
        })();
      }
    }
  }, {
    key: '_hookAClick',
    value: function _hookAClick() {
      var _this8 = this;

      document.body.addEventListener('click', function (e) {
        var a = e.target.closest('a');

        if (!a || a.getAttribute('spa-history-skip') != null) {
          return;
        }

        var url = new _browserUrl2.default(a.href);
        var base = new _browserUrl2.default(_this8.base);
        if (url.href.indexOf(base.href) != 0) {
          return;
        }

        var target = a.getAttribute('target');
        if (target && (target == '_blank' || target == '_parent' && window.parent != window || target == '_top' && window.top != window || !(target in { _self: 1, _blank: 1, _parent: 1, _top: 1 }) && target != window.name)) {
          return;
        }

        e.preventDefault();
        url = _this8._parseUrl(url.href);
        _this8.goto(url.href);
      });
    }
  }, {
    key: 'length',
    get: function get() {
      return this._session.length;
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];

/***/ }
/******/ ])
});
;