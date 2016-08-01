import Url from 'browser-url';

export default class {
  constructor({ mode = null, base = '', onNavigate = null } = {}) {
    this.mode = mode;
    this.base = base;
    this.onNavigate = onNavigate;

    if (!this.mode) {
      this.mode = history.pushState && location.protocol.indexOf('http') == 0 ? 'html5' : 'hash';
    }

    let url = new Url();

    // convert hash to html5
    if (this.mode == 'html5' && url.hash.indexOf('#!') == 0) {
      //
    } else if (this.mode == 'hash' && location.protocol.indexOf('http') == 0 && url.pathname != this.base) {
      //
    }

    this.length = 0;
    this.current = null;

    this._nativeLength = history.length;
  }

  _changeState(method, path, query) {
    let sid = Math.random().toString(16).slice(2);
    if (this.mode == 'html5') {
      path = new Url(this.base + path).addQuery(query).href;
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
  }

  splice() {}

  push() {}

  replace() {}

  reset() {}

  pop() {}

  go() {}

  back() {}

  forward() {}

  get() {}

  setState() {}
}
