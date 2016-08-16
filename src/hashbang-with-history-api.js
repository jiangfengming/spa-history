export default {
  _changeHistory(method, item, url) {
    history[method + 'State']({ id: item.id }, '', '#!' + url.pathname + url.search + url.hash);
  },

  // doesn't need to fallback to hashbang URL if history API is available
  _convertLocation() {},

  _parseCurrentUrl() {

  }
};
