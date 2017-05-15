import Base from './Base'
import { appendSearchParams } from './util'

export default class extends Base {
  getCurrentLocation() {
    return location.pathname + location.search + location.hash
  }

  url(path, opts) {
    if (!opts) {
      return this.base + path.slice(1)
    } else {
      const url = new URL(path, 'file://')
      if (opts.query) appendSearchParams(url.searchParams, location.query)
      if (opts.hash) url.hash = opts.hash
      return this.base + url.pathname.slice(1) + url.search + url.hash
    }
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
