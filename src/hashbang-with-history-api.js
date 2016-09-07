import Url from 'browser-url';
import mixinHtml5 from './html5';

export default {
  _changeHistory(method, id, url) {
    history[method + 'State']({ id }, '', '#!' + url.pathname + url.search + url.hash);
    return Promise.resolve();
  },

  _go: mixinHtml5._go,

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

  _registerEvent: mixinHtml5._registerEvent,
  _enableEvent: mixinHtml5._enableEvent,
  _disableEvent: mixinHtml5._disableEvent
};
