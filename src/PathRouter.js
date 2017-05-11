import Base from './Base'

export default class extends Base {
  _parseUrl(url) {
    url = new URL(url)
    url.pathname = url.pathname.replace(this.base, '/')
    return url
  }

  url(location) {
    if（location.constructor === String) {
      return this.base + location.slice(1)
    } else {

    }
    const url = this._locationToUrl(location)
    return this._baseNoTrailingSlash + url.pathname + url.search + url.hash
  }

  _changeHistory(method, url) {
    history[method + 'State']({ id: url.id }, '', this._baseNoTrailingSlash + url.pathname + url.search + url.hash)
  }

  _go(n) {
    if (!n) return Promise.resolve()

    const promise = new Promise(resolve => {
      const fn = () => {
        window.removeEventListener('popstate', fn)
        resolve()
      }
      window.addEventListener('popstate', fn)
    })
    history.go(n)
    return promise
  }

  _getCurrentId() {
    return history.state ? history.state.id : null
  }

  _registerEvent() {
    this._navigateEvent = () => {
      this._onNavigate()
    }
    this._eventDisabled = true
    this._enableEvent()
  }

  _enableEvent() {
    if (this._eventDisabled) {
      window.addEventListener('popstate', this._navigateEvent)
      this._eventDisabled = false
    }
  }

  _disableEvent() {
    if (!this._eventDisabled) {
      window.removeEventListener('popstate', this._navigateEvent)
      this._eventDisabled = true
    }
  }
}
