import mixinHashbangWithHistoryApi from './hashbang-with-history-api';

export default {
  url: mixinHashbangWithHistoryApi.url,

  _changeHistory(method, url) {
    let promise = new Promise(resolve => {
      let eventDisabled = this._eventDisabled;
      this._disableEvent();
      let fn = () => {
        window.removeEventListener('hashchange', fn);
        if (!eventDisabled) {
          this._enableEvent();
        }
        resolve();
      };
      window.addEventListener('hashchange', fn);
    });

    url.addQuery('_sid', url.id);
    location[method == 'push' ? 'assign' : 'replace']('#!' + url.pathname + url.search + url.hash);
    url.removeQuery('_sid');

    return promise;
  },

  _go(n) {
    if (!n) {
      return Promise.resolve();
    }

    let promise = new Promise(resolve => {
      let fn = () => {
        window.removeEventListener('hashchange', fn);
        resolve();
      };
      window.addEventListener('hashchange', fn);
    });
    history.go(n);
    return promise;
  },

  // fallback to hashbang url if browser doesn't history API
  _convertLocation() {
    if (this.base && location.pathname != this.base && location.protocol.indexOf('http') == 0) {
      let url = location.pathname.replace(this._baseNoTrailingSlash, '');
      url = this.base + '#!' + url + location.search + location.hash;
      location.replace(url);
      // stop executing
      throw 1;
    }
  },

  _getCurrentId() {
    let url = mixinHashbangWithHistoryApi._parseUrl.call(this);
    return url.query._sid;
  },

  _parseUrl(url) {
    url = mixinHashbangWithHistoryApi._parseUrl.call(this, url);
    url.removeQuery('_sid');
    return url;
  },

  _registerEvent() {
    this._navigateEvent = () => {
      this._onNavigate();
    };
    this._eventDisabled = true;
    this._enableEvent();
  },

  _enableEvent() {
    if (this._eventDisabled) {
      window.addEventListener('hashchange', this._navigateEvent);
      this._eventDisabled = false;
    }
  },

  _disableEvent() {
    if (!this._eventDisabled) {
      window.removeEventListener('hashchange', this._navigateEvent);
      this._eventDisabled = true;
    }
  }
};
