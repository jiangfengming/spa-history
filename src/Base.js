import { appendSearchParams } from './util'

const SUPPORT_HISTORY_API = typeof window === 'object' && window.history && window.history.pushState

export default class {
  constructor({ beforeChange = () => {}, onChange }) {
    this.beforeChange = beforeChange
    this.onChange = onChange
  }

  _init() {
    this.current = this._normalize('/')
    if (SUPPORT_HISTORY_API) {
      this._onpopstate = () => {
        this._beforeChange(this._getCurrentLocation(), false, 'push', 'push')
      }

      window.addEventListener('popstate', this._onpopstate)
      this._beforeChange(this._getCurrentLocation(), false, 'replace', 'replace')
    }
  }

  url(loc) {
    if (loc.constructor === Object) loc = this._normalize(loc).fullPath
    return this._url(loc)
  }

  _normalize(loc) {
    if (loc.fullPath) return loc // normalized

    if (loc.constructor === String) loc = { path: loc }

    const url = new URL(loc.path, 'file://')
    if (loc.query) appendSearchParams(url.searchParams, location.query)
    if (loc.hash) url.hash = loc.hash
    return Object.assign({ state: {} }, loc, {
      path: url.pathname,
      query: url.searchParams,
      hash: url.hash,
      fullPath: url.pathname + url.search + url.hash
    })
  }

  _getCurrentLocation() {
    const state = window.history.state || {}
    const loc = this._normalize(state.path || this._getCurrentPath())
    loc.state = state.state || {}
    if (state.path) loc.hidden = true
    return loc
  }

  _beforeChange(to, onSuccess, onFail, onRedirect) {
    Promise.resolve(this.beforeChange(to, this.current)).then(ret => {
      if (ret == null || ret === true) {
        if (onSuccess) this.__changeHistory(onSuccess, to)
        this.current = to
        this.onChange(to)
      } else if (ret.constructor === String || ret.constructor === Object) {
        this._changeHistory(onRedirect, ret)
      } else if (ret === false && onFail) {
        this._changeHistory(onFail, this.current)
      }
    })
  }


  /*
    {
      path,
      query,
      hash,
      state,
      hidden
    }
  */
  push(to) {
    this._changeHistory('push', to)
  }

  replace(to) {
    this._changeHistory('replace', to)
  }

  setState(state) {
    Object.assign(this.current.state, state)
    this.__changeHistory('replace', this.current)
  }

  _changeHistory(method, to) {
    to = this._normalize(to)
    if (to.silent) {
      this.__changeHistory(method, to)
      this.current = to
    } else {
      this._beforeChange(to, method, false, method)
    }
  }

  __changeHistory(method, to) {
    if (!SUPPORT_HISTORY_API) return

    const state = { state: to.state }

    let url = this._url(to.fullPath)
    if (to.hidden) {
      state.path = to.fullPath
      url = undefined
    }

    window.history[method + 'State'](state, '', url)
  }

  go(n, { state = null, slient = false } = {}) {
    if (!SUPPORT_HISTORY_API) return

    const onpopstate = () => {
      window.removeEventListener('popstate', onpopstate)
      window.addEventListener('popstate', this._onpopstate)

      const to = this._getCurrentLocation()

      if (state) {
        Object.assign(to.state, state)
        this.__changeHistory('replace', to)
      }

      if (slient) this.current = to
      else this._beforeChange(to, false, 'push', 'push')
    }

    window.removeEventListener('popstate', this._onpopstate)
    window.addEventListener('popstate', onpopstate)
  }

  back(opts) {
    return this.go(-1, opts)
  }

  forward(opts) {
    return this.go(1, opts)
  }
}
