import Base from './Base'

export default class extends Base {
  getCurrentLocation() {
    return location.hash.slice(1) || '/'
  }

  url(location) {
    const url = this._locationToUrl(location)
    return '#!' + url.pathname + url.search + url.hash
  },

  _changeHistory(method, url) {
    history[method + 'State']({ id: url.id }, '', '#!' + url.pathname + url.search + url.hash)
  },

  _go: mixinHtml5._go,

  _getCurrentId() {
    return history.state ? history.state.id : null
  }
}
