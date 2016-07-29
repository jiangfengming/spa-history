import Url from 'browser-url';

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
      //
    } else if (this.mode == 'hash' && location.protocol.indexOf('http') == 0 && url.pathname != this.base) {
      //
    }



    if (history.pushState) {
      this._push = (path, sid) => {
        path = this.base + path;
        this.pushState({ sid }, '', path);
      };

      this._replace = (path, sid) => {

      };
    } else {
      this._push = (path, sid) => {

      };

      this._replace = (path, sid) => {

      };
    }



    this.length = 0;
    this.current = null;

    this._nativeLength = history.length;

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
