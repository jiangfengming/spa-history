function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function appendSearchParams(searchParams, q) {
  switch (q.constructor) {
    case Object:
      for (var name in q) {
        searchParams.append(name, q[name]);
      }

      break;

    case String:
      q = new URLSearchParams(q);
    // falls through

    case URLSearchParams:
      q = Array.from(q);
    // falls through

    case Array:
      for (var _iterator = q, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var _ref2 = _ref,
            _name = _ref2[0],
            value = _ref2[1];
        searchParams.append(_name, value);
      }

      break;
  }
}

var SUPPORT_HISTORY_API = typeof window === 'object' && window.history && window.history.pushState;
var SUPPORT_HISTORY_ERR = 'Current environment doesn\'t support History API';

var _default =
/*#__PURE__*/
function () {
  function _default(_ref) {
    var _ref$beforeChange = _ref.beforeChange,
        beforeChange = _ref$beforeChange === void 0 ? function () {} : _ref$beforeChange,
        change = _ref.change;
    this.beforeChange = beforeChange;
    this.change = change;
    this.current = null;
  }

  var _proto = _default.prototype;

  _proto.start = function start(loc) {
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

  _proto.url = function url(loc) {
    if (loc.constructor === Object) loc = this.normalize(loc).fullPath;
    return this._url(loc);
  };

  _proto.normalize = function normalize(loc) {
    if (loc.constructor === String) {
      loc = {
        path: loc
      };
    } else {
      loc = Object.assign({}, loc);
    }

    if (loc.external || /^\w+:\/\//.test(loc.path)) {
      loc.path = this._extractPathFromExternalURL(new URL(loc.path, 'file://'));
      delete loc.external;
    }

    var url = new URL(loc.path, 'file://');
    if (loc.query) appendSearchParams(url.searchParams, loc.query);
    if (loc.hash) url.hash = loc.hash;
    Object.assign(loc, {
      path: url.pathname,
      query: url.searchParams,
      hash: url.hash,
      fullPath: url.pathname + url.search + url.hash,
      state: loc.state ? JSON.parse(JSON.stringify(loc.state)) : {} // dereferencing

    });
    loc.url = this._url(loc.fullPath);
    return loc;
  };

  _proto._getCurrentLocationFromBrowser = function _getCurrentLocationFromBrowser() {
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
     dispatch
    success: nop                       fail: nop                                     redirect: _beforeChange('dispatch', redirect)
  */


  _proto._beforeChange = function _beforeChange(op, to) {
    var _this2 = this;

    // to is the same as current and op is push, set op to replace
    if (this.current && to.path === this.current.path && to.query.toString() === this.current.query.toString() && op === 'push') op = 'replace';
    Promise.resolve(this.beforeChange(to, this.current, op)).then(function (ret) {
      if (ret == null || ret === true) {
        if (op === 'push' || op === 'replace') _this2.__changeHistory(op, to);
        _this2.current = to;

        _this2.change(to);
      } else if (ret.constructor === String || ret.constructor === Object) {
        if (op === 'init') op = 'replace';else if (op === 'popstate') op = 'push';else if (ret.method) op = ret.method;

        _this2._beforeChange(op, _this2.normalize(ret));
      } else if (ret === false) {
        if (op === 'popstate') _this2.__changeHistory('push', _this2.current);
      }
    });
  };

  _proto.dispatch = function dispatch(to) {
    to = this.normalize(to);

    this._beforeChange('dispatch', to);
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


  _proto.push = function push(to) {
    this._changeHistory('push', to);
  };

  _proto.replace = function replace(to) {
    this._changeHistory('replace', to);
  };

  _proto.setState = function setState(state) {
    Object.assign(this.current.state, JSON.parse(JSON.stringify(state))); // dereferencing

    this.__changeHistory('replace', this.current);
  };

  _proto._changeHistory = function _changeHistory(method, to) {
    to = this.normalize(to);

    if (to.silent) {
      this.__changeHistory(method, to);

      this.current = to;
    } else {
      this._beforeChange(method, to);
    }
  };

  _proto.__changeHistory = function __changeHistory(method, to) {
    if (!SUPPORT_HISTORY_API) return;
    var state = {};
    if (to.state) state.state = to.state;

    var url = this._url(to.fullPath);

    if (to.hidden) {
      state.path = to.fullPath;
      url = to.appearPath && this.url(to.appearPath);
    }

    window.history[method + 'State'](Object.keys(state).length ? state : null, '', url);
  };

  _proto.go = function go(n, _temp) {
    var _this3 = this;

    var _ref2 = _temp === void 0 ? {} : _temp,
        _ref2$state = _ref2.state,
        state = _ref2$state === void 0 ? null : _ref2$state,
        _ref2$silent = _ref2.silent,
        silent = _ref2$silent === void 0 ? false : _ref2$silent;

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

  _proto.back = function back(opts) {
    return this.go(-1, opts);
  };

  _proto.forward = function forward(opts) {
    return this.go(1, opts);
  };

  _proto.captureLinkClickEvent = function captureLinkClickEvent(e) {
    var a = e.target.closest('a'); // force not handle the <a> element

    if (!a || a.getAttribute('spa-history-skip') != null) return; // open new window

    var target = a.getAttribute('target');
    if (target && (target === '_blank' || target === '_parent' && window.parent !== window || target === '_top' && window.top !== window || !(target in {
      _self: 1,
      _blank: 1,
      _parent: 1,
      _top: 1
    }) && target !== window.name)) return; // out of app

    if (a.href.indexOf(location.origin + this.url('/')) !== 0) return;
    var to = this.normalize(a.href); // hash change

    if (to.path === this.current.path && to.query.toString() === this.current.query.toString() && to.hash && to.hash !== this.current.hash) return;
    e.preventDefault();
    this.push(to);
  };

  return _default;
}();

var _default$1 =
/*#__PURE__*/
function (_Base) {
  _inheritsLoose(_default$$1, _Base);

  function _default$$1(args) {
    var _this;

    _this = _Base.call(this, args) || this;
    _this.base = args.base || '/';
    return _this;
  }

  var _proto = _default$$1.prototype;

  _proto._extractPathFromExternalURL = function _extractPathFromExternalURL(url) {
    return url.pathname.replace(this.base, '/') + url.search + url.hash;
  };

  _proto._url = function _url(loc) {
    return this.base + loc.slice(1);
  };

  return _default$$1;
}(_default);

var _default$2 =
/*#__PURE__*/
function (_Base) {
  _inheritsLoose(_default$$1, _Base);

  function _default$$1() {
    return _Base.apply(this, arguments) || this;
  }

  var _proto = _default$$1.prototype;

  _proto._extractPathFromExternalURL = function _extractPathFromExternalURL(url) {
    return url.hash.slice(1) || '/';
  };

  _proto._url = function _url(loc) {
    return loc === '/' ? location.pathname + location.search : '#' + loc;
  };

  return _default$$1;
}(_default);

export { _default$1 as PathHistory, _default$2 as HashHistory };
