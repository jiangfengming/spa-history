import { appendSearchParams } from './util'

const SUPPORT_HISTORY_API = typeof window === 'object' && window.history && window.history.pushState

export default class {
  constructor({ onchange }) {
    this.onchange = onchange
  }

  _init() {
    this.current = this._normalize('/')
    if (SUPPORT_HISTORY_API) {
      window.addEventListener('popstate', this._onpopstate)
      const to = this._getCurrentLocation()
      this.replace(to)
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
    return Object.assign({}, loc, {
      path: url.pathname,
      query: url.searchParams,
      hash: url.hash,
      fullPath: url.pathname + url.search + url.hash
    })
  }

  _getCurrentLocation() {
    const loc = this._normalize(history.state.path || this._getCurrentPath())
    loc.state = history.state.state
    loc.position = history.state.position
    if (history.state.path) loc.hidden = true
    return loc
  }

  _dispatchChangeEvent(to, onSuccess, onRedirect) {
    if (to === this.current) return
    Promise.resolve(this.onchange(to, this.current)).then(res => {
      if (res === true || res === undefined) {
        this.current = to
      } else if (res === false) {
        this.push(this.current)
      } else {
        this.push(res)
      }
    })
  }

  _onpopstate() {
    const to = this._getCurrentLocation()
    this._dispatchChangeEvent(to)
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
  push(...args) {
    this._changeHistory('push', ...args)
  }

  replace(...args) {
    this._changeHistory('replace', ...args)
  }

  setState(state) {
    Object.assign(this.current.state, state)
    if (SUPPORT_HISTORY_API) this._changeHistory('replace', this.current)
  }

  _changeHistory(method, to, { silent = false } = {}) {
    to = this._normalize(to)
    if (silent) {
      this._changeHistory('push', to)
    } else {
      this._dispatchChangeEvent(to).then(res => {
        if (res) this._changeHistory('push', to)
      })
    }
  }

  _changeHistory(method, to) {
    if (!SUPPORT_HISTORY_API) return

    const state = { state: to.state }

    let url = to.fullPath
    if (to.hidden) {
      state.path = to.fullPath
      url = undefined
    }

    window.history[method + 'State'](state, '', url)
  }

  go(n, { state = null, slient = false } = {}) {
    if (!SUPPORT_HISTORY_API) return

    this.eventDisabled = true
    history.go(n)

    return new Promise(resolve => {
      const onpopstate = () => {
        window.removeEventListener('popstate', onpopstate)

        if (state) {
          this.setState(state)
        }

        resolve()
      }

      window.removeEventListener('popstate', this._onpopstate)
      window.addEventListener('popstate', onpopstate)
    })
  }

  back(opts) {
    return this.go(-1, opts)
  }

  forward(opts) {
    return this.go(1, opts)
  }
}
