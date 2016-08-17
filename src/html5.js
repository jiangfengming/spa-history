import Url from 'browser-url';

export default {
  _changeHistory(method, item, url) {
    history[method + 'State']({ id: item.id }, '', this._baseNoTrailingSlash + url.pathname + url.search + url.hash);
  },

  // convert hashbang URL to HTML5 URL
  _convertLocation() {
    if (location.hash.indexOf('#!') == 0) {
      let url = this._baseNoTrailingSlash + (location.hash.slice(2) || '/');
      url = new Url(url).removeQuery('_sid').href;
      history.replaceState(null, '', url);
    }
  },

  _getCurrentSessionId() {
    return history.state ? history.state.id.split(':') : [];
  },

  _parseCurrentUrl() {
    let url = new Url();
    let item = {
      path: url.pathname.replace(this._baseNoTrailingSlash, ''),
      query: url.query,
      hash: url.hash
    };

    if (history.state) {
      let [sessionId, id] = history.state.id.split(':');
    }
  }
};
