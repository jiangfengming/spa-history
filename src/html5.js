import Url from 'browser-url';

export default {
  _changeHistory(method, url) {
    history[method + 'State']({ id: url.id }, '', this._baseNoTrailingSlash + url.pathname + url.search + url.hash);
    return Promise.resolve();
  },

  _go(n) {
    if (!n) {
      return Promise.resolve();
    }

    history.go(n);

    return new Promise(resolve => {
      let fn = () => {
        window.removeEventListener('popstate', fn);
        resolve();
      };
      window.addEventListener('popstate', fn);
    });
  },

  // convert hashbang URL to HTML5 URL
  _convertLocation() {
    if (location.hash.indexOf('#!') == 0) {
      let url = this._baseNoTrailingSlash + (location.hash.slice(2) || '/');
      url = new Url(url).removeQuery('_sid').href;
      history.replaceState(null, '', url);
    }
  },

  _getCurrentId() {
    return history.state ? history.state.id : null;
  },

  _parseCurrentLocation() {
    let url = new Url().sortQuery();
    url.pathname = url.pathname.replace(this._baseNoTrailingSlash, '');
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
      window.addEventListener('popstate', this._navigateEvent);
      this._eventDisabled = false;
    }
  },

  _disableEvent() {
    if (!this._eventDisabled) {
      window.removeEventListener('popstate', this._navigateEvent);
      this._eventDisabled = true;
    }
  }
};
