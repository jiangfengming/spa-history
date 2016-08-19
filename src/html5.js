import Url from 'browser-url';

export default {
  _changeHistory(method, item, url) {
    history[method + 'State']({ id: item.id }, '', this._baseNoTrailingSlash + url.pathname + url.search + url.hash);
    return Promise.resolve();
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
        window.removeEventListener('popstate', fn);
        if (!eventDisabled) {
          this._enableEvent();
        }
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

  _getCurrentItemId() {
    return history.state ? history.state.id : null;
  },

  _parseCurrentLocation() {
    let url = new Url().sortQuery();
    return {
      path: url.pathname.replace(this._baseNoTrailingSlash, ''),
      query: url.query,
      hash: url.hash
    };
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
