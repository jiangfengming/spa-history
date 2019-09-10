import { StringCaster } from 'cast-string';

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function appendSearchParams(searchParams, q) {
  switch (q.constructor) {
    case Object:
      Object.entries(q).forEach(function (_ref) {
        var key = _ref[0],
            val = _ref[1];

        if (val != null) {
          if (val.constructor === Array) {
            val.forEach(function (v) {
              return searchParams.append(key, v);
            });
          } else {
            searchParams.append(key, val);
          }
        }
      });
      break;

    case String:
      q = new URLSearchParams(q);
    // falls through

    case URLSearchParams:
      q.forEach(function (val, key) {
        return searchParams.append(key, val);
      });
      break;

    case Array:
      q.forEach(function (_ref2) {
        var key = _ref2[0],
            val = _ref2[1];
        return searchParams.append(key, val);
      });
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
        afterChange = _ref.afterChange;
    this.beforeChange = beforeChange;
    this.afterChange = afterChange;
    this.current = null;
  }

  var _proto = _default.prototype;

  _proto.start = function start(loc) {
    var _this = this;

    if (!loc && SUPPORT_HISTORY_API) {
      loc = this._getCurrentLocationFromBrowser();
    } else {
      loc = this.normalize(loc);
    }

    this._beforeChange('init', loc);

    if (SUPPORT_HISTORY_API) {
      this._onpopstate = function () {
        _this._beforeChange('pop', _this._getCurrentLocationFromBrowser());
      };

      window.addEventListener('popstate', this._onpopstate);
    }
  };

  _proto.url = function url(loc) {
    return this.normalize(loc).url;
  };

  _proto.normalize = function normalize(loc) {
    if (loc.constructor === String) {
      loc = {
        path: loc
      };
    } else {
      loc = Object.assign({}, loc);
    }

    var hasOrigin = /^\w+:\/\//.test(loc.path);

    if (loc.external || hasOrigin) {
      loc.path = this._extractPathFromExternalURL(new URL(hasOrigin ? loc.path : 'http://a.a' + loc.path));
      delete loc.external;
    }

    var url = new URL('http://a.a' + loc.path);

    if (loc.query) {
      appendSearchParams(url.searchParams, loc.query instanceof StringCaster ? loc.query.source : loc.query);
    }

    if (loc.hash) {
      url.hash = loc.hash;
    }

    Object.assign(loc, {
      path: url.pathname,
      query: new StringCaster(url.searchParams),
      hash: url.hash,
      fullPath: url.pathname + url.search + url.hash,
      state: loc.state ? JSON.parse(JSON.stringify(loc.state)) : {} // dereferencing

    });
    loc.url = this._url(loc);
    return loc;
  };

  _proto._getCurrentLocationFromBrowser = function _getCurrentLocationFromBrowser() {
    var state = window.history.state || {};
    var loc = this.normalize(state.__path__ || this._extractPathFromExternalURL(window.location));
    loc.state = state;

    if (state.__path__) {
      loc.hidden = true;
    }

    return loc;
  }
  /*
    init
    success: nop                       fail: _beforeChange('replace', current)       redirect: _beforeChange('replace', redirect)
     push
    success: pushState(to)             fail: nop                                     redirect: _beforeChange('push', redirect)
     replace
    success: replaceState(to)          fail: nop                                     redirect: _beforeChange('replace', redirect)
     pop
    success: nop                       fail: __changeHistory('push', current)        redirect: _beforeChange('push', redirect)
     dispatch
    success: nop                       fail: nop                                     redirect: _beforeChange('dispatch', redirect)
  */
  ;

  _proto._beforeChange = function _beforeChange(action, to) {
    var _this2 = this;

    // `to` is same as `current` and `action` is `push`, set `action` to `replace`
    if (this.current && to.path === this.current.path && to.query.source.toString() === this.current.query.source.toString() && action === 'push') {
      action = 'replace';
    }

    Promise.resolve(this.beforeChange(to, this.current, action)).then(function (ret) {
      if (ret === undefined || ret === true) {
        if (action === 'push' || action === 'replace') {
          _this2.__changeHistory(action, to);
        }

        var from = _this2.current;
        _this2.current = to;

        _this2.afterChange(to, from, action);
      } else if (ret === false) {
        if (action === 'popstate') {
          _this2.__changeHistory('push', _this2.current);
        }
      } // do nothing if returns null
      else if (ret === null) {
          return;
        } else if (ret.constructor === String || ret.constructor === Object) {
          if (ret.action) {
            action = ret.action;
          } else if (action === 'init') {
            action = 'replace';
          } else if (action === 'popstate') {
            action = 'push';
          }

          _this2._beforeChange(action, _this2.normalize(ret));
        }
    });
  };

  _proto.dispatch = function dispatch(to) {
    to = this.normalize(to);

    this._beforeChange('dispatch', to);
  }
  /*
    {
      path,
      query,
      hash,
      state,
      hidden
    }
  */
  ;

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

  _proto._changeHistory = function _changeHistory(action, to) {
    to = this.normalize(to);

    if (to.silent) {
      this.__changeHistory(action, to);

      this.current = to;
    } else {
      this._beforeChange(action, to);
    }
  };

  _proto.__changeHistory = function __changeHistory(action, to) {
    if (!SUPPORT_HISTORY_API) {
      return;
    }

    var state = to.state;
    var url = to.url;

    if (to.hidden) {
      state.__path__ = to.fullPath;
      url = to.appearPath && this.url(to.appearPath);
    }

    window.history[action + 'State'](Object.keys(state).length ? state : null, '', url);
  };

  _proto.go = function go(n, _temp) {
    var _this3 = this;

    var _ref2 = _temp === void 0 ? {} : _temp,
        _ref2$state = _ref2.state,
        state = _ref2$state === void 0 ? null : _ref2$state,
        _ref2$silent = _ref2.silent,
        silent = _ref2$silent === void 0 ? false : _ref2$silent;

    return new Promise(function (resolve, reject) {
      if (!SUPPORT_HISTORY_API) {
        return reject(new Error(SUPPORT_HISTORY_ERR));
      }

      var onpopstate = function onpopstate() {
        window.removeEventListener('popstate', onpopstate);
        window.addEventListener('popstate', _this3._onpopstate);

        var to = _this3._getCurrentLocationFromBrowser();

        if (state) {
          Object.assign(to.state, state);

          _this3.__changeHistory('replace', to);
        }

        if (silent) {
          _this3.current = to;
        } else {
          _this3._beforeChange('pop', to);
        }

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
    if (e.defaultPrevented) {
      return;
    }

    var a = e.target.closest('a'); // force not handle the <a> element

    if (!a) {
      return;
    } // open new window


    var target = a.target;

    if (target && (target === '_blank' || target === '_parent' && window.parent !== window || target === '_top' && window.top !== window || !(target in {
      _self: 1,
      _blank: 1,
      _parent: 1,
      _top: 1
    }) && target !== window.name)) {
      return;
    } // outside of app


    if (!a.href.startsWith(location.origin + this.url('/'))) {
      return;
    }

    var to = this.normalize(a.href); // hash change

    if (to.path === this.current.path && to.query.source.toString() === this.current.query.source.toString() && to.hash) {
      return;
    }

    e.preventDefault();
    this.push(to);
  };

  return _default;
}();

var _default$1 =
/*#__PURE__*/
function (_Base) {
  _inheritsLoose(_default, _Base);

  function _default(args) {
    var _this;

    _this = _Base.call(this, args) || this;
    _this.base = args.base || '';
    return _this;
  }

  var _proto = _default.prototype;

  _proto._extractPathFromExternalURL = function _extractPathFromExternalURL(url) {
    var path = url.pathname;

    if (this.base && this.base !== '/' && path.startsWith(this.base)) {
      path = path.replace(this.base, '');

      if (!path) {
        path = '/';
      } else if (this.base.endsWith('/')) {
        path = '/' + path;
      }
    }

    return path + url.search + url.hash;
  };

  _proto._url = function _url(loc) {
    // if base is not end with /
    // do not append / if is the root path
    if (loc.path === '/' && this.base && !this.base.endsWith('/')) {
      return this.base + loc.fullPath.slice(1);
    }

    return (this.base && this.base.endsWith('/') ? this.base.slice(0, -1) : this.base) + loc.fullPath;
  };

  return _default;
}(_default);

var _default$2 =
/*#__PURE__*/
function (_Base) {
  _inheritsLoose(_default, _Base);

  function _default() {
    return _Base.apply(this, arguments) || this;
  }

  var _proto = _default.prototype;

  _proto._extractPathFromExternalURL = function _extractPathFromExternalURL(url) {
    return url.hash.slice(1) || '/';
  };

  _proto._url = function _url(loc) {
    return loc.fullPath === '/' ? location.pathname + location.search : '#' + loc.fullPath;
  };

  return _default;
}(_default);

export { _default$2 as HashHistory, _default$1 as PathHistory };
