import Url from 'browser-url';

/*
session struct
{
  current: { path, sid, state, query },
  currentIndex,
  session: [
    [
      { path, sid, state, query }
    ],

    [
      { path, sid, state, query }
    ]
  ]
}
*/

export default class {
  constructor({ mode = null, base = '/', onNavigate = null } = {}) {
    this.mode = mode;
    this.base = base;
    this.onNavigate = onNavigate;

    if (!this.mode) {
      this.mode = history.pushState && location.protocol.indexOf('http') == 0 ? 'html5' : 'hash';
    }

    let url = new Url();

    // convert hash to html5
    if (this.mode == 'html5' && url.hash.indexOf('#!') == 0) {
      history.replaceState();
    } else if (this.mode == 'hash' && location.protocol.indexOf('http') == 0 && url.pathname != this.base) {
      location.replace();
    }

    this.length = 0;
    this.current = null;

    this._nativeLength = history.length;

    this.session = [];


    window.addEventListener('popstate', function(e) {
      // e.state
    });

    window.addEventListener('hashchange', function() {

    });
  }

  _change(method, path, query) {
    let sid = Math.random().toString(16).slice(2);
    if (this.mode == 'html5') {
      path = new Url(this.base.replace(/\/$/, '') + path).addQuery(query).href;
      history[method + 'State']({ sid }, '', path);
    } else {
      path = new Url(path).addQuery(query);
      if (history.pushState) {
        path = '#!' + path.pathname + path.search + path.hash;
        history[method + 'State']({ sid }, '', path);
      } else {
        path.addQuery('_sid', sid);
        path = '#!' + path.pathname + path.search + path.hash;
        location[method == 'push' ? 'assign' : 'replace'](path);
      }
    }
    return sid;
  }

  _saveSession() {
    sessionStorage.setItem('_spaHistory', JSON.stringify(this.session));
  }

  _readSession() {

  }

  splice() {}

  push(path, query, state) {
    let sid = this._change('push', path, query);
    this.session.push({
      path,
      sid,
      query,
      state
    });
    this._saveSession();
  }

  replace() {}

  reset() {}

  pop() {}

  go() {}

  back() {}

  forward() {}

  get() {}

  setState(state, index) {
    if (!index) {
      index = this.current.index;
    }

    this.session[index].state = state;
    this._saveSession();
  }
}
