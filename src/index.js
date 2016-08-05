import Url from 'browser-url';

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
      url = new Url(url).removeQuery('_hid').href;
      history.replaceState(null, '', url);
    }
    // convert html5 to hash
    else if (this.mode == 'hash' && this.base && location.pathname != this.base && location.protocol.indexOf('http') == 0) {
      let url = location.pathname.replace(this._baseNoTrailingSlash, '');
      url = this.base + '#!' + url + location.search + location.hash;
      location.replace(url);
      return;
    }

    // get session
    this.session = this._readData();

    // init session
    if (!this.session) {
      this.session = {
        current: null,
        sessions: []
      };
    }

    // get history id
    if (history.pushState) {
      // page is reloaded
      if (history.state) {
        let [sessionId, id] = history.state.id.split(':');
        this._sessionId = Number(sessionId);
        this.items = this._data.sessions[this._sessionId];
        let current = this.findById(id);
        this.current = current.value;
        this._currentIndex = current.index;


      }
      // page is first loaded
      else {
        let url = this._parseCurrentUrl();
        
        if (this.mode == 'html5') {

        } else {
          this._change('replace');
        }
      }
    } else {
      let url = new Url(location.hash.replace('#!', '') || '/');
      // page is reloaded
      if (url.query._hid) {

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

  _parseCurrentUrl() {
    if (this.mode == 'html5') {
      return new Url();
    } else {
      return new Url(location.hash.slice(2) || '/');
    }
  }

  _change(method, path, query, hid) {
    if (!hid) {
      hid = Math.random().toString(16).slice(2);
    }

    if (this.mode == 'html5') {
      let url = new Url(this._baseNoTrailingSlash + path).addQuery(query).href;
      history[method + 'State']({ hid }, '', url);
    } else {
      let url = new Url(path).addQuery(query);
      if (history.pushState) {
        url = '#!' + url.pathname + url.search + url.hash;
        history[method + 'State']({ hid }, '', url);
      } else {
        url.addQuery('_hid', hid);
        url = '#!' + url.pathname + url.search + url.hash;
        location[method == 'push' ? 'assign' : 'replace'](url);
      }
    }
    return hid;
  }


  /*
  struct
  {
    current: { path, hid, state, query },
    sessions: [
      [
        { path, hid, state, query }
      ],

      [
        { path, hid, state, query }
      ]
    ]
  }
  */
  _saveData() {
    sessionStorage.setItem('_spaHistory', JSON.stringify(this._data));
  }

  _readData() {
    return JSON.parse(sessionStorage.getItem('_spaHistory'));
  }

  splice() {}

  push(...items) {
    let hid = this._change('push', path, query);
    this._data.sessions[this._sessionId].push({
    });
    this._saveData();
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
    }
  }
}
