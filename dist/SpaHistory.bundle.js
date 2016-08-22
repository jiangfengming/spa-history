(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["SpaHistory"] = factory();
	else
		root["SpaHistory"] = factory();
})(this, function() {
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

function Url(url) {
  this.parse(url);
}

Url.parseSearch = function(search) {
  var query = {};
  if (search.length > 1) {
    search.slice(1).split('&').forEach(function(s) {
      var pair = s.split('=');
      var key = decodeURIComponent(pair[0]);
      var value = pair.length == 1 ? '' : decodeURIComponent(pair[1]);
      if (query[key] == undefined) {
        query[key] = value;
      } else {
        if (query[key].constructor != Array) {
          query[key] = [query[key]];
        }
        query[key].push(value);
      }
    });
  }
  return query;
};

Url.formatSearch = function(query) {
  var search = '';
  for (var p in query) {
    [].concat(query[p]).forEach(function(val) {
      if (val == null) {
        return;
      }
      search += '&' + encodeURIComponent(p);
      if (val !== '') {
        search += '=' + encodeURIComponent(val);
      }
    });
  }
  return search ? '?' + search.slice(1) : '';
};

Url.prototype = {
  parse: function(url) {
    if (!url) {
      var obj = location;
    } else {
      var obj = document.createElement('a');
      obj.href = url;

      // IE doesn't populate all link properties when setting .href with a relative URL,
      // however .href will return an absolute URL which then can be used on itself
      // to populate these additional fields.
      obj.href = obj.href;
    }

    this.protocol = obj.protocol;
    this.hostname = obj.hostname;
    this.port = obj.port;
    this.search = obj.search;
    this.hash = obj.hash;
    this.query = Url.parseSearch(obj.search);
    // pathname doesn't include the leading slash in IE
    this.pathname = obj.pathname;
    if (this.pathname.charAt(0) != '/') {
      this.pathname = '/' + this.pathname;
    }
  },

  get host() {
    return this.hostname + (this.port ? ':' + this.port : '');
  },

  set host(h) {
    h = h.split(':');
    this.hostname = h[0];
    if (h[1]) {
      this.port = h[1];
    }
  },

  get port() {
    return this._port;
  },

  set port(p) {
    if ((this.protocol == 'http:' && p == '80') || (this.protocol == 'https:' && p == '443')) {
      p = '';
    }

    this._port = p || '';
  },

  get href() {
    return this.format();
  },

  set href(url) {
    this.parse(url);
  },

  get search() {
    return Url.formatSearch(this.query);
  },

  set search(s) {
    this.query = Url.parseSearch(s);
  },

  set: function(key, value) {
    this[key] = value;
    return this;
  },

  format: function() {
    if (this.host) {
      return this.protocol + '//' + this.host + this.pathname + this.search + this.hash;
    } else {
      return this.protocol + this.pathname + this.search + this.hash;
    }
  },

  addQuery: function(name, value) {
    if (name != null) {
      if (name.constructor == String) {
        var obj = {};
        obj[name] = value;
      } else {
        var obj = name;
      }

      for (var p in obj) {
        this.query[p] = obj[p];
      }
    }

    return this;
  },

  removeQuery: function() {
    for (var i = arguments.length - 1; i >= 0; i--) {
      delete this.query[arguments[i]];
    }
    return this;
  },

  setQuery: function(query) {
    this.query = query;
    return this;
  },

  sortQuery: function(fn) {
    var query = this.query;
    var arr = [];
    for (var key in query) {
      arr.push(key);
    }
    var sortedQuery = {};
    arr.sort(fn).forEach(function(key) {
      sortedQuery[key] = query[key];
    });
    this.query = sortedQuery;
    return this;
  },

  valueOf: function() {
    return this.format();
  },

  toString: function() {
    return this.format();
  }
};

// CommonJS
if (typeof module != 'undefined' && module.exports) {
  module.exports = Url;
}


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
  _changeHistory: function _changeHistory(method, item, url) {
    history[method + 'State']({ id: item.id }, '', '#!' + url.pathname + url.search + url.hash);
  },


  _go: _html2.default._go,
  _onLocationChange: _html2.default._onLocationChange,

  // no need to fallback to hashbang URL if history API is available
  _convertLocation: function _convertLocation() {},
  _getCurrentItemId: function _getCurrentItemId() {
    return history.state ? history.state.id : null;
  },
  _parseCurrentLocation: function _parseCurrentLocation() {
    var url = void 0;
    if (location.hash.indexOf('#!') == 0) {
      url = location.hash.slice(2);
    } else {
      url = '/';
    }

    url = new _browserUrl2.default(url).sortQuery();
    return {
      path: url.pathname,
      query: url.query,
      hash: url.hash
    };
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
  _changeHistory: function _changeHistory(method, item, url) {
    history[method + 'State']({ id: item.id }, '', this._baseNoTrailingSlash + url.pathname + url.search + url.hash);
    return Promise.resolve();
  },
  _go: function _go(n) {
    if (!n) {
      return Promise.resolve();
    }

    history.go(n);
    return this._onLocationChange();
  },
  _onLocationChange: function _onLocationChange() {
    var _this = this;

    return new Promise(function (resolve) {
      var eventDisabled = _this._eventDisabled;
      _this._disableEvent();
      var fn = function fn() {
        window.removeEventListener('popstate', fn);
        if (!eventDisabled) {
          _this._enableEvent();
        }
        resolve();
      };
      window.addEventListener('popstate', fn);
    });
  },


  // convert hashbang URL to HTML5 URL
  _convertLocation: function _convertLocation() {
    if (location.hash.indexOf('#!') == 0) {
      var url = this._baseNoTrailingSlash + (location.hash.slice(2) || '/');
      url = new _browserUrl2.default(url).removeQuery('_sid').href;
      history.replaceState(null, '', url);
    }
  },
  _getCurrentItemId: function _getCurrentItemId() {
    return history.state ? history.state.id : null;
  },
  _parseCurrentLocation: function _parseCurrentLocation() {
    var url = new _browserUrl2.default().sortQuery();
    return {
      path: url.pathname.replace(this._baseNoTrailingSlash, ''),
      query: url.query,
      hash: url.hash
    };
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

var _browserUrl = __webpack_require__(0);

var _browserUrl2 = _interopRequireDefault(_browserUrl);

var _hashbangWithHistoryApi = __webpack_require__(1);

var _hashbangWithHistoryApi2 = _interopRequireDefault(_hashbangWithHistoryApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  _changeHistory: function _changeHistory(method, item, url) {
    url = new _browserUrl2.default(url);
    url.addQuery('_sid', item.id);
    location[method == 'push' ? 'assign' : 'replace']('#!' + url.pathname + url.search + url.hash);
    return this._onLocationChange();
  },
  _go: function _go(n) {
    if (!n) {
      return Promise.resolve();
    }

    history.go(n);
    return this._onLocationChange();
  },
  _onLocationChange: function _onLocationChange() {
    var _this = this;

    return new Promise(function (resolve) {
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
  _getCurrentItemId: function _getCurrentItemId() {
    var item = _hashbangWithHistoryApi2.default._parseCurrentLocation.call(this);
    return item.query._sid;
  },
  _parseCurrentLocation: function _parseCurrentLocation() {
    var item = _hashbangWithHistoryApi2.default._parseCurrentLocation.call(this);
    delete item.query._sid;
    return item;
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

    var itemId = this._getCurrentItemId();
    var sessionId = void 0,
        session = void 0;
    var itemIndex = -1;
    if (itemId) {
      sessionId = Number(itemId.split(':')[0]);
      session = this._data.sessions[sessionId];
      if (session) {
        itemIndex = session.findIndex(function (item) {
          return item.id == itemId;
        });
      }
    }

    var promise = void 0;
    // new session
    if (itemIndex == -1) {
      this._sessionId = this._data.sessions.length;
      this._session = [];
      this._data.sessions.push(this._session);
      var item = this._parseCurrentLocation();
      promise = this._change('replace', item).then(function (item) {
        _this._session.push(item);
        _this._setCurrentItem(_this._session.length - 1);
      });
    } else {
      this._sessionId = sessionId;
      this._session = session;
      this._setCurrentItem(itemIndex);
    }

    Promise.resolve(promise).then(function () {
      _this._saveData();
      _this._registerEvent();
      _this._hookAClick();
      _this._dispatchEvent('navigate');
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

      for (var _len = arguments.length, items = Array(_len), _key = 0; _key < _len; _key++) {
        items[_key] = arguments[_key];
      }

      items.forEach(function (item) {
        promise = promise.then(function () {
          return _this2._change('push', item).then(function (item) {
            _this2._session.push(item);
            if (item.state) {
              _this2.setStateById(item.state, item.id);
            }
          });
        });
      });

      return promise.then(function () {
        _this2._setCurrentItem(_this2._session.length - 1);
        _this2._saveData();
      });
    }
  }, {
    key: 'replace',
    value: function replace(item) {
      var _this3 = this;

      return this._change('replace', item).then(function (item) {
        _this3._session[_this3._cursor] = item;
        if (item.state) {
          _this3.setStateById(item.state, item.id);
        }
        _this3._setCurrentItem(_this3._cursor);
        _this3._saveData();
      });
    }
  }, {
    key: 'reset',
    value: function reset() {
      for (var _len2 = arguments.length, items = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        items[_key2] = arguments[_key2];
      }

      return this.splice.apply(this, [0, this._session.length].concat(items));
    }
  }, {
    key: 'splice',
    value: function splice(start, deleteCount) {
      for (var _len3 = arguments.length, insertItems = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        insertItems[_key3 - 2] = arguments[_key3];
      }

      var _this4 = this;

      return new Promise(function (resolve) {
        var originalLength = _this4._session.length;
        var goSteps = void 0,
            index = void 0;
        var replaceFirst = false;

        if (start < 2) {
          goSteps = 0 - _this4._cursor;
          index = 0;
          replaceFirst = true;
        } else {
          goSteps = start - _this4._cursor - 2;
          index = start - 2;
        }

        _this4._disableEvent();
        _this4.go(goSteps).then(function () {
          var _session;

          (_session = _this4._session).splice.apply(_session, [start, deleteCount].concat(insertItems));

          var promise = Promise.resolve();

          var fn = function fn(index) {
            var item = _this4._session[index];
            var p = void 0;
            if (replaceFirst) {
              replaceFirst = false;
              p = _this4._change('replace', item);
            } else {
              p = _this4._change('push', item);
            }

            promise = promise.then(function () {
              return p.then(function (item) {
                _this4._session[index] = item;
                if (item.state) {
                  _this4.setStateById(item.state, item.id);
                }
              });
            });
          };

          for (; index < _this4._session.length; index++) {
            fn(index);
          }

          promise.then(function () {
            var p = void 0;
            if (_this4._session.length == 1 && originalLength > 1) {
              _this4._setCurrentItem(0);
              p = _this4._change('push', {
                id: 'PLACEHOLDER',
                path: _this4.current.path,
                query: _this4.current.query,
                hash: _this4.current.hash
              }).then(function () {
                return _this4.back();
              });
            } else {
              var lastIndex = _this4._session.length - 1;
              var currentIndex = _this4.findIndexById(_this4.current.id);
              if (currentIndex == -1) {
                currentIndex = lastIndex;
              } else if (currentIndex != lastIndex) {
                p = _this4.go(currentIndex - lastIndex);
              }

              _this4._setCurrentItem(currentIndex);
              _this4._saveData();
            }

            Promise.resolve(p).then(function () {
              _this4._enableEvent();
              resolve();
            });
          });
        });
      });
    }
  }, {
    key: 'goto',
    value: function goto(location) {
      var _this5 = this;

      var url = this._createUrl(location);
      var currentUrl = this._createUrl(this.current);

      // different location
      if (url.pathname + url.search != currentUrl.pathname + currentUrl.search) {
        return this.push(location).then(function () {
          _this5._dispatchEvent('navigate');
        });
      }
      // same location
      else {
          // hash changed
          if (url.hash != currentUrl.hash) {
            location = this._format(location);
            location.id = this._getStateId(this.current.id) + ':' + this._uniqueId();
            return this.push(location).then(function () {
              _this5._dispatchEvent('hashChange');
            });
          }
          // nothing changed, and no hash present
          else if (!currentUrl.hash) {
              this._dispatchEvent('navigate');
            }

          return Promise.resolve();
        }
    }
  }, {
    key: 'reload',
    value: function reload() {
      this._dispatchEvent('navigate');
      return this;
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
      item = this._session[index];
      if (!item) {
        return null;
      }

      var item = Object.assign({}, item); // copy
      var stateId = this._getStateId(item.id);
      item.state = this._data.states[stateId];
      return item;
    }
  }, {
    key: 'getAll',
    value: function getAll() {
      var _this6 = this;

      return this._session.map(function (v, i) {
        return _this6.get(i);
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
      return this._session.findIndex(function (item) {
        return item.path == path;
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
    value: function setState(state, index) {
      var id = index != undefined && this._session[index] ? this._session[index].id : null;
      return this.setStateById(state, id);
    }
  }, {
    key: 'setStateById',
    value: function setStateById(state, id) {
      if (!id) {
        id = this.current.id;
      }

      var stateId = this._getStateId(id);
      this._data.states[stateId] = state;
      if (id == this.current.id) {
        this.current.state = state;
      }
      this._saveData();
      return this;
    }
  }, {
    key: '_getStateId',
    value: function _getStateId(id) {
      var _id = id.split(':');
      return _id.length == 2 ? id : _id[0] + ':' + _id[1];
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
        this.current = this._parseCurrentLocation();
        this.current.id = this._getCurrentItemId();
      }
    }
  }, {
    key: '_change',
    value: function _change(method, item) {
      item = this._format(item);
      var url = this._createUrl(item);

      if (!item.id) {
        item.id = this._sessionId + ':' + this._uniqueId();
      }

      item.path = url.pathname;
      item.query = url.query;
      item.hash = url.hash;

      return this._changeHistory(method, item, url).then(function () {
        if (item.title) {
          document.title = item.title;
        }

        return item;
      });
    }
  }, {
    key: '_format',
    value: function _format(item) {
      if (item.constructor == String) {
        item = {
          path: item
        };
      } else {
        item = Object.assign({}, item); // copy
      }

      return item;
    }
  }, {
    key: '_createUrl',
    value: function _createUrl(loc) {
      if (loc.constructor == String) {
        return new _browserUrl2.default(loc).sortQuery();
      } else {
        var url = new _browserUrl2.default(loc.path).addQuery(loc.query).sortQuery();

        if (loc.hash) {
          url.hash = loc.hash;
        }

        return url;
      }
    }
  }, {
    key: '_uniqueId',
    value: function _uniqueId() {
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

  }, {
    key: '_saveData',
    value: function _saveData() {
      var _this7 = this;

      // optimize for multiple calls in a short period
      if (!this._saveDataTimer) {
        this._saveDataTimer = setTimeout(function () {
          _this7._saveDataTimer = null;
          _this7._data.sessions[_this7._sessionId] = _this7._session;
          sessionStorage.setItem('_spaHistory', JSON.stringify(_this7._data));
        }, 100);
      }
    }
  }, {
    key: '_readData',
    value: function _readData() {
      return JSON.parse(sessionStorage.getItem('_spaHistory'));
    }
  }, {
    key: '_dispatchEvent',
    value: function _dispatchEvent(name) {
      if (name == 'navigate') {
        this.onNavigate(this.current);
      } else if (name == 'hashChange') {
        this.onHashChange && this.onHashChange(this.current.hash);
      }
    }
  }, {
    key: '_onNavigate',
    value: function _onNavigate() {
      var _this8 = this;

      var id = this._getCurrentItemId();
      if (id == 'PLACEHOLDER') {
        this._disableEvent();
        this.back().then(function () {
          _this8._enableEvent();
        });
      } else {
        this._setCurrentItem(this.findIndexById(id));
        this._dispatchEvent('navigate');
      }
    }
  }, {
    key: '_hookAClick',
    value: function _hookAClick() {
      var _this9 = this;

      document.body.addEventListener('click', function (e) {
        var a = e.target.closest('a');

        if (!a || a.getAttribute('spa-history-skip') != null) {
          return;
        }

        var url = new _browserUrl2.default(a.href);
        var base = new _browserUrl2.default(_this9.base);
        if (url.href.indexOf(base.href) != 0) {
          return;
        }

        var target = a.getAttribute('target');
        if (target && (target == '_blank' || target == '_parent' && window.parent != window || target == '_top' && window.top != window || !(target in { _self: 1, _blank: 1, _parent: 1, _top: 1 }) && target != window.name)) {
          return;
        }

        e.preventDefault();
        _this9.goto(url.href);
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