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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  _changeHistory: function _changeHistory(method, item, url) {
    history[method + 'State']({ id: item.id }, '', '#!' + url.pathname + url.search + url.hash);
  },


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
  _registerEvent: function _registerEvent() {
    var _this = this;

    window.addEventListener('popstate', function () {
      _this._onNavigate();
    });
  }
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

var _hashbangWithHistoryApi = __webpack_require__(1);

var _hashbangWithHistoryApi2 = _interopRequireDefault(_hashbangWithHistoryApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  _changeHistory: function _changeHistory(method, item, url) {
    url.addQuery('_sid', item.id);
    this._disableEvent();
    location[method == 'push' ? 'assign' : 'replace']('#!' + url.pathname + url.search + url.hash);
    this._enableEvent();
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
    var _this = this;

    window.addEventListener('hashchange', function () {
      _this._onNavigate();
    });
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  _changeHistory: function _changeHistory(method, item, url) {
    history[method + 'State']({ id: item.id }, '', this._baseNoTrailingSlash + url.pathname + url.search + url.hash);
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
    var _this = this;

    window.addEventListener('popstate', function () {
      _this._onNavigate();
    });
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

var _html = __webpack_require__(3);

var _html2 = _interopRequireDefault(_html);

var _hashbangWithHistoryApi = __webpack_require__(1);

var _hashbangWithHistoryApi2 = _interopRequireDefault(_hashbangWithHistoryApi);

var _hashbangOnly = __webpack_require__(2);

var _hashbangOnly2 = _interopRequireDefault(_hashbangOnly);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class() {
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

    // new session
    if (itemIndex == -1) {
      this._sessionId = this._data.sessions.length;
      this._session = [];
      this._data.sessions.push(this._session);
      var item = this._parseCurrentLocation();
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

  _createClass(_class, [{
    key: 'push',
    value: function push() {
      if (this.currentIndex != this._session.length - 1) {
        this._session = this._session.slice(0, this.currentIndex + 1);
      }

      for (var _len = arguments.length, items = Array(_len), _key = 0; _key < _len; _key++) {
        items[_key] = arguments[_key];
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          item = this._change('push', item);
          this._session.push(item);
          if (item.state) {
            this.setStateById(item.state, item.id);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this._setCurrentItem(this._session.length - 1);
      this._saveData();
      return this;
    }
  }, {
    key: 'replace',
    value: function replace(item) {
      item = this._change('replace', item);
      this._session[this.currentIndex] = item;
      if (item.state) {
        this.setStateById(item.state, item.id);
      }
      this._setCurrentItem(this.currentIndex);
      this._saveData();
      return this;
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

      var _this = this;

      return new Promise(function (resolve) {
        var originalLength = _this._session.length;
        var goSteps = void 0,
            index = void 0;
        var replaceFirst = false;

        if (start < 2) {
          goSteps = 0 - _this.currentIndex;
          index = 0;
          replaceFirst = true;
        } else {
          goSteps = start - _this.currentIndex - 2;
          index = start - 2;
        }

        _this._disableEvent();
        _this.go(goSteps).then(function () {
          var _session;

          (_session = _this._session).splice.apply(_session, [start, deleteCount].concat(insertItems));
          for (; index < _this._session.length; index++) {
            var item = _this._session[index];
            if (replaceFirst) {
              item = _this._change('replace', item);
              replaceFirst = false;
            } else {
              item = _this._change('push', item);
            }
            _this._session[index] = item;
            if (item.state) {
              _this.setStateById(item.state, item.id);
            }
          }

          var promise = void 0;

          if (_this._session.length == 1 && originalLength > 1) {
            _this._setCurrentItem(0);
            _this._change('push', {
              id: 'PLACEHOLDER',
              path: _this.current.path,
              query: _this.current.query,
              hash: _this.current.hash
            });

            promise = _this.back();
          } else {
            var lastIndex = _this._session.length - 1;
            var currentIndex = _this.findIndexById(_this.current.id);
            if (currentIndex == -1) {
              currentIndex = lastIndex;
            } else if (currentIndex != lastIndex) {
              promise = _this.go(currentIndex - lastIndex);
            }

            _this._setCurrentItem(currentIndex);
            _this._saveData();
          }

          Promise.resolve(promise).then(function () {
            _this._enableEvent();
            resolve();
          });
        });
      });
    }
  }, {
    key: 'goto',
    value: function goto(location) {
      var url = this._createUrl(location);
      var currentUrl = this._createUrl(this.current);

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
  }, {
    key: 'reload',
    value: function reload() {
      this._dispatchEvent('navigate');
      return this;
    }
  }, {
    key: 'pop',
    value: function pop() {
      this.splice(this._session.length - 1, 1);
      return this;
    }
  }, {
    key: 'go',
    value: function go(n) {
      var _this2 = this;

      if (n == 0) {
        return Promise.resolve();
      } else {
        return new Promise(function (resolve) {
          history.go(n);
          _this2._goResolve = resolve;
        });
      }
    }
  }, {
    key: 'back',
    value: function back() {
      return this.go(-1);
    }
  }, {
    key: 'forward',
    value: function forward() {
      return this.go(1);
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
      var _this3 = this;

      return this._session.map(function (v, i) {
        return _this3.get(i);
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
      var id = index ? this._session[index].id : null;
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
      this.current = this.get(index);
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

      this._changeHistory(method, item, url);

      if (item.title) {
        document.title = item.title;
      }

      return item;
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
      var _this4 = this;

      // optimize for multiple calls in a short period
      if (!this._saveDataTimer) {
        this._saveDataTimer = setTimeout(function () {
          _this4._saveDataTimer = null;
          _this4._data.sessions[_this4._sessionId] = _this4._session;
          sessionStorage.setItem('_spaHistory', JSON.stringify(_this4._data));
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
    key: '_disableEvent',
    value: function _disableEvent() {
      this._eventDisabled = true;
    }
  }, {
    key: '_enableEvent',
    value: function _enableEvent() {
      this._eventDisabled = false;
    }
  }, {
    key: '_onNavigate',
    value: function _onNavigate() {
      var _this5 = this;

      if (this._goResolve) {
        this._goResolve();
        this._goResolve = null;
      }

      if (!this._eventDisabled) {
        var id = this._getCurrentItemId();
        if (id == 'PLACEHOLDER') {
          this._disableEvent();
          this.back().then(function () {
            _this5._enableEvent();
          });
        } else {
          this._setCurrentItem(this.findIndexById(id));
          this._dispatchEvent('navigate');
        }
      }
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