import Url from 'browser-url';

/*
session struct
{
  current: { path, sid, state, query },
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
  constructor({ mode, base = '/', onNavigate } = {}) {
    this.mode = mode;
    if (!this.mode) {
      this.mode = history.pushState && location.protocol.indexOf('http') == 0 ? 'html5' : 'hash';
    }

    this.base = base;
    this._baseNoTrailingSlash = base.replace(/\/$/, '');
    this.onNavigate = onNavigate;

    // convert hash to html5
    if (this.mode == 'html5' && location.hash.indexOf('#!') == 0) {
      let url = this._baseNoTrailingSlash + (location.hash.slice(2) || '/');
      url = new Url(url).removeQuery('_sid').href;
      history.replaceState(null, '', url);
    }
    // convert html5 to hash
    else if (this.mode == 'hash' && this.base && location.pathname != this.base && location.protocol.indexOf('http') == 0) {
      let url = location.pathname.replace(this._baseNoTrailingSlash, '');
      url = this.base + '#!' + url + location.search + location.hash;
      location.replace(url);
      return;
    }

    // get/init session
    this.state = this._getState();

    // get sid
    if (history.pushState) {
      // page is reloaded
      if (history.state) {
        let sid = history.state.sid;
      }
      // page is first loaded
      else {

      }
    } else {
      let url = new Url(location.hash.replace('#!', '') || '/');
      // page is reloaded
      if (url.query._sid) {

      }
      // page is first loaded
      else {

      }
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
      let url = new Url(this._baseNoTrailingSlash + path).addQuery(query).href;
      history[method + 'State']({ sid }, '', url);
    } else {
      let url = new Url(path).addQuery(query);
      if (history.pushState) {
        url = '#!' + url.pathname + url.search + url.hash;
        history[method + 'State']({ sid }, '', url);
      } else {
        url.addQuery('_sid', sid);
        url = '#!' + url.pathname + url.search + url.hash;
        location[method == 'push' ? 'assign' : 'replace'](url);
      }
    }
    return sid;
  }

  _saveSession() {
    sessionStorage.setItem('_spaHistory', JSON.stringify(this.session));
  }

  _readSession() {
    let session = sessionStorage.getItem('_spaHistory');
    if (session) {
      return JSON.parse(session);
    } else {
      return {

      };
    }
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
