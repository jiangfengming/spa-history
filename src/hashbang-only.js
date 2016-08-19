import Url from 'browser-url';
import mixinHashbangWithHistoryApi from './hashbang-with-history-api';

export default {
  _changeHistory(method, item, url) {
    url = new Url(url);
    url.addQuery('_sid', item.id);
    location[method == 'push' ? 'assign' : 'replace']('#!' + url.pathname + url.search + url.hash);
    return this._onLocationChange();
  },

  _go(n) {
    if (!n) {
      return Promise.resolve();
    }

    history.go(n);
    return this._onLocationChange();
  },

  _onLocationChange() {
    return new Promise((resolve) => {
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

  _getCurrentItemId() {
    let item = mixinHashbangWithHistoryApi._parseCurrentLocation.call(this);
    return item.query._sid;
  },

  _parseCurrentLocation() {
    let item = mixinHashbangWithHistoryApi._parseCurrentLocation.call(this);
    delete item.query._sid;
    return item;
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
