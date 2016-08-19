import hashbangWithHistoryApi from './hashbang-with-history-api';

export default {
  _changeHistory(method, item, url) {
    url.addQuery('_sid', item.id);
    this._disableEvent();
    location[method == 'push' ? 'assign' : 'replace']('#!' + url.pathname + url.search + url.hash);
    this._enableEvent();
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
    let item = hashbangWithHistoryApi._parseCurrentLocation.call(this);
    return item.query._sid;
  },

  _parseCurrentLocation() {
    let item = hashbangWithHistoryApi._parseCurrentLocation.call(this);
    delete item.query._sid;
    return item;
  },

  _registerEvent() {
    window.addEventListener('hashchange', () => {
      this._onNavigate();
    });
  }
};
