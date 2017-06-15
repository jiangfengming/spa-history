(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.PathHistory = factory());
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
var SUPPORT_HISTORY_ERR = 'Current environment doesn\'t support History API';

var _class$2 = function () {
  function _class(_ref) {
    var _ref$beforeChange = _ref.beforeChange,
        beforeChange = _ref$beforeChange === undefined ? function () {} : _ref$beforeChange,
        change = _ref.change;
    classCallCheck(this, _class);

    this.beforeChange = beforeChange;
    this.change = change;
  }

  _class.prototype.start = function start(loc) {
    var _this = this;

    if (!loc && SUPPORT_HISTORY_API) loc = this._getCurrentLocationFromBrowser();else loc = this.normalize(loc);

    this._beforeChange('init', loc);

    if (SUPPORT_HISTORY_API) {
      this._onpopstate = function () {
        _this._beforeChange('popstate', _this._getCurrentLocationFromBrowser());
      };

      window.addEventListener('popstate', this._onpopstate);
    }
  };

  _class.prototype.url = function url(loc) {
    if (loc.constructor === Object) loc = this.normalize(loc).fullPath;
    return this._url(loc);
  };

  _class.prototype.normalize = function normalize(loc) {
    if (loc.fullPath) return loc; // normalized

    if (loc.constructor === String) loc = { path: loc };

    if (loc.external || /^\w+:\/\//.test(loc.path)) {
      loc.path = this._extractPathFromExternalURL(new URL(loc.path, 'file://'));
      delete loc.external;
    }

    var url = new URL(loc.path, 'file://');
    if (loc.query) appendSearchParams(url.searchParams, loc.query);
    if (loc.hash) url.hash = loc.hash;
    return Object.assign({ state: {} }, loc, {
      path: url.pathname,
      query: url.searchParams,
      hash: url.hash,
      fullPath: url.pathname + url.search + url.hash
    });
  };

  _class.prototype._getCurrentLocationFromBrowser = function _getCurrentLocationFromBrowser() {
    var state = window.history.state || {};
    var loc = this.normalize(state.path || this._extractPathFromExternalURL(window.location));
    loc.state = state.state || {};
    if (state.path) loc.hidden = true;
    return loc;
  };

  /*
    init
    success: nop                       fail: _beforeChange('replace', current)       redirect: _beforeChange('replace', redirect)
     push
    success: pushState(to)             fail: nop                                     redirect: _beforeChange('push', redirect)
     replace
    success: replaceState(to)          fail: nop                                     redirect: _beforeChange('replace', redirect)
     popstate
    success: nop                       fail: __changeHistory('push', current)        redirect: _beforeChange('push', redirect)
     sessionless
    success: nop                       fail: nop                                     redirect: _beforeChange('sessionless', redirect)
  */


  _class.prototype._beforeChange = function _beforeChange(op, to) {
    var _this2 = this;

    // to is the same as current and op is push, set op to replace
    if (this.current && to.path === this.current.path && to.query.toString() === this.current.query.toString() && op === 'push') op = 'replace';

    Promise.resolve(this.beforeChange(to, this.current)).then(function (ret) {
      if (ret == null || ret === true) {
        if (op === 'push' || op === 'replace') _this2.__changeHistory(op, to);
        _this2.current = to;
        _this2.change(to);
      } else if (ret.constructor === String || ret.constructor === Object) {
        if (op === 'init') op = 'replace';else if (op === 'popstate') op = 'push';
        _this2._beforeChange(op, _this2.normalize(ret));
      } else if (ret === false) {
        if (op === 'popstate') _this2.__changeHistory('push', _this2.current);
      }
    });
  };

  _class.prototype.dispatch = function dispatch(to) {
    to = this.normalize(to);
    this._beforeChange('sessionless', to);
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
    to = this.normalize(to);
    if (to.silent) {
      this.__changeHistory(method, to);
      this.current = to;
    } else {
      this._beforeChange(method, to);
    }
  };

  _class.prototype.__changeHistory = function __changeHistory(method, to) {
    if (!SUPPORT_HISTORY_API) return;

    var state = {};
    if (to.state) state.state = to.state;

    var url = this._url(to.fullPath);
    if (to.hidden) {
      state.path = to.fullPath;
      url = undefined;
    }

    window.history[method + 'State'](Object.keys(state).length ? state : null, '', url);
  };

  _class.prototype.go = function go(n) {
    var _this3 = this;

    var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref2$state = _ref2.state,
        state = _ref2$state === undefined ? null : _ref2$state,
        _ref2$silent = _ref2.silent,
        silent = _ref2$silent === undefined ? false : _ref2$silent;

    return new Promise(function (resolve, reject) {
      if (!SUPPORT_HISTORY_API) return reject(new Error(SUPPORT_HISTORY_ERR));

      var onpopstate = function onpopstate() {
        window.removeEventListener('popstate', onpopstate);
        window.addEventListener('popstate', _this3._onpopstate);

        var to = _this3._getCurrentLocationFromBrowser();

        if (state) {
          Object.assign(to.state, state);
          _this3.__changeHistory('replace', to);
        }

        if (silent) _this3.current = to;else _this3._beforeChange('popstate', to);

        resolve();
      };

      window.removeEventListener('popstate', _this3._onpopstate);
      window.addEventListener('popstate', onpopstate);

      window.history.go(n);
    });
  };

  _class.prototype.back = function back(opts) {
    return this.go(-1, opts);
  };

  _class.prototype.forward = function forward(opts) {
    return this.go(1, opts);
  };

  _class.prototype.hookAnchorElements = function hookAnchorElements() {
    var _this4 = this;

    var container = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.body;

    container.addEventListener('click', function (e) {
      var a = e.target.closest('a'

      // force not handle the <a> element
      );if (!a || a.getAttribute('spa-history-skip') != null) return;

      // open new window
      var target = a.getAttribute('target');
      if (target && (target === '_blank' || target === '_parent' && window.parent !== window || target === '_top' && window.top !== window || !(target in { _self: 1, _blank: 1, _parent: 1, _top: 1 }) && target !== window.name)) return;

      // out of app
      if (a.href.indexOf(location.origin + _this4.url('/')) !== 0) return;

      var to = _this4.normalize(a.href

      // hash change
      );if (to.path === _this4.current.path && to.query.toString() === _this4.current.query.toString() && to.hash && to.hash !== _this4.current.hash) return;

      e.preventDefault();
      _this4.push(to);
    });
  };

  return _class;
}();

var _class = function (_Base) {
  inherits(_class, _Base);

  function _class(args) {
    classCallCheck(this, _class);

    var _this = possibleConstructorReturn(this, _Base.call(this, args));

    _this.base = args.base || '/';
    return _this;
  }

  _class.prototype._extractPathFromExternalURL = function _extractPathFromExternalURL(url) {
    return url.pathname.replace(this.base, '/') + url.search + url.hash;
  };

  _class.prototype._url = function _url(loc) {
    return this.base + loc.slice(1);
  };

  return _class;
}(_class$2);

return _class;

})));
