import Url from 'browser-url';

export default {
  _changeHistory(method, item, url) {
    history[method + 'State']({ id: item.id }, '', '#!' + url.pathname + url.search + url.hash);
  },

  // no need to fallback to hashbang URL if history API is available
  _convertLocation() {},

  _getCurrentItemId() {
    return history.state ? history.state.id : null;
  },

  _parseCurrentLocation() {
    let url;
    if (location.hash.indexOf('#!') == 0) {
      url = location.hash.slice(2);
    } else {
      url = '/';
    }

    url = new Url(url).sortQuery();
    return {
      path: url.pathname,
      query: url.query,
      hash: url.hash
    };
  },

  _registerEvent() {
    window.addEventListener('popstate', () => {
      this._onNavigate();
    });
  }
};
