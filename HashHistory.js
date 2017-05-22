(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.HashHistory = factory());
}(this, (function () { 'use strict';

function appendSearchParams(searchParams, q) {
  switch (q.constructor) {
    case Object:
      for (var name in q) {
        searchParams.append(name, q[name]);
      }break;
    case String:
      q = new URLSearchParams(q);
    case URLSearchParams:
      // eslint-disable-line
      q = Array.from(q);
    case Array:
      // eslint-disable-line
      for (var _iterator = q, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref2;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref2 = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref2 = _i.value;
        }

        var _ref = _ref2;
        var _name = _ref[0];
        var value = _ref[1];
        searchParams.append(_name, value);
      }break;
  }
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var SUPPORT_HISTORY_API = (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window.history && window.history.pushState;

var _class$2 = function () {
  function _class(_ref) {
    var _ref$beforeChange = _ref.beforeChange,
        beforeChange = _ref$beforeChange === undefined ? function () {} : _ref$beforeChange,
        onChange = _ref.onChange;
    classCallCheck(this, _class);

    this.beforeChange = beforeChange;
    this.onChange = onChange;
  }

  _class.prototype._init = function _init() {
    var _this = this;

    this.current = this._normalize('/');
    if (SUPPORT_HISTORY_API) {
      this._onpopstate = function () {
        _this._beforeChange(_this._getCurrentLocation(), false, 'push', 'push');
      };

      window.addEventListener('popstate', this._onpopstate);
      this._beforeChange(this._getCurrentLocation(), false, 'replace', 'replace');
    }
  };

  _class.prototype.url = function url(loc) {
    if (loc.constructor === Object) loc = this._normalize(loc).fullPath;
    return this._url(loc);
  };

  _class.prototype._normalize = function _normalize(loc) {
    if (loc.fullPath) return loc; // normalized

    if (loc.constructor === String) loc = { path: loc };

    var url = new URL(loc.path, 'file://');
    if (loc.query) appendSearchParams(url.searchParams, location.query);
    if (loc.hash) url.hash = loc.hash;
    return Object.assign({ state: {} }, loc, {
      path: url.pathname,
      query: url.searchParams,
      hash: url.hash,
      fullPath: url.pathname + url.search + url.hash
    });
  };

  _class.prototype._getCurrentLocation = function _getCurrentLocation() {
    var state = window.history.state || {};
    var loc = this._normalize(state.path || this._getCurrentPath());
    loc.state = state.state || {};
    if (state.path) loc.hidden = true;
    return loc;
  };

  _class.prototype._beforeChange = function _beforeChange(to, onSuccess, onFail, onRedirect) {
    var _this2 = this;

    Promise.resolve(this.beforeChange(to, this.current)).then(function (ret) {
      if (ret == null || ret === true) {
        if (onSuccess) _this2.__changeHistory(onSuccess, to);
        _this2.current = to;
        _this2.onChange(to);
      } else if (ret.constructor === String || ret.constructor === Object) {
        _this2._changeHistory(onRedirect, ret);
      } else if (ret === false && onFail) {
        _this2._changeHistory(onFail, _this2.current);
      }
    });
  };

  /*
    {
      path,
      query,
      hash,
      state,
      hidden
    }
  */


  _class.prototype.push = function push(to) {
    this._changeHistory('push', to);
  };

  _class.prototype.replace = function replace(to) {
    this._changeHistory('replace', to);
  };

  _class.prototype.setState = function setState(state) {
    Object.assign(this.current.state, state);
    this.__changeHistory('replace', this.current);
  };

  _class.prototype._changeHistory = function _changeHistory(method, to) {
    to = this._normalize(to);
    if (to.silent) {
      this.__changeHistory(method, to);
      this.current = to;
    } else {
      this._beforeChange(to, method, false, method);
    }
  };

  _class.prototype.__changeHistory = function __changeHistory(method, to) {
    if (!SUPPORT_HISTORY_API) return;

    var state = { state: to.state };

    var url = this._url(to.fullPath);
    if (to.hidden) {
      state.path = to.fullPath;
      url = undefined;
    }

    window.history[method + 'State'](state, '', url);
  };

  _class.prototype.go = function go(n) {
    var _this3 = this;

    var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref2$state = _ref2.state,
        state = _ref2$state === undefined ? null : _ref2$state,
        _ref2$slient = _ref2.slient,
        slient = _ref2$slient === undefined ? false : _ref2$slient;

    if (!SUPPORT_HISTORY_API) return;

    var onpopstate = function onpopstate() {
      window.removeEventListener('popstate', onpopstate);
      window.addEventListener('popstate', _this3._onpopstate);

      var to = _this3._getCurrentLocation();

      if (state) {
        Object.assign(to.state, state);
        _this3.__changeHistory('replace', to);
      }

      if (slient) _this3.current = to;else _this3._beforeChange(to, false, 'push', 'push');
    };

    window.removeEventListener('popstate', this._onpopstate);
    window.addEventListener('popstate', onpopstate);
  };

  _class.prototype.back = function back(opts) {
    return this.go(-1, opts);
  };

  _class.prototype.forward = function forward(opts) {
    return this.go(1, opts);
  };

  return _class;
}();

var _class = function (_Base) {
  inherits(_class, _Base);

  function _class(args) {
    classCallCheck(this, _class);

    var _this = possibleConstructorReturn(this, _Base.call(this, args));

    _this._init();
    return _this;
  }

  _class.prototype._getCurrentPath = function _getCurrentPath() {
    return location.hash.slice(1) || '/';
  };

  _class.prototype._url = function _url(loc) {
    return loc === '/' ? location.pathname + location.search : '#' + loc;
  };

  return _class;
}(_class$2);

return _class;

})));
