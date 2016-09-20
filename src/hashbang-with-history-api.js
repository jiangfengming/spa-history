import Url from 'browser-url';
import mixinHtml5 from './html5';

export default {
  url(location) {
    let url = this._locationToUrl(location);
    return '#!' + url.pathname + url.search + url.hash;
  },

  _changeHistory(method, url) {
    history[method + 'State']({ id: url.id }, '', '#!' + url.pathname + url.search + url.hash);
    return Promise.resolve();
  },

  _go: mixinHtml5._go,

  // no need to fallback to hashbang URL if history API is available
  _convertLocation() {},

  _getCurrentId() {
    return history.state ? history.state.id : null;
  },

  _parseUrl(url) {
    url = new Url(url);
    if (url.hash.indexOf('#!') == 0) {
      url = url.hash.slice(2);
    } else {
      url = '/';
    }

    return new Url(url).sortQuery();
  },

  _registerEvent: mixinHtml5._registerEvent,
  _enableEvent: mixinHtml5._enableEvent,
  _disableEvent: mixinHtml5._disableEvent
};
