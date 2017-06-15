import { appendSearchParams } from './util'

const SUPPORT_HISTORY_API = typeof window === 'object' && window.history && window.history.pushState
const SUPPORT_HISTORY_ERR = 'Current environment doesn\'t support History API'

export default class {
  constructor({ beforeChange = () => {}, change }) {
    this.beforeChange = beforeChange
    this.change = change
  }

  start(loc) {
    if (!loc && SUPPORT_HISTORY_API) loc = this._getCurrentLocationFromBrowser()
    else loc = this.normalize(loc)

    this._beforeChange('init', loc)

    if (SUPPORT_HISTORY_API) {
      this._onpopstate = () => {
        this._beforeChange('popstate', this._getCurrentLocationFromBrowser())
      }

      window.addEventListener('popstate', this._onpopstate)
    }
  }

  url(loc) {
    if (loc.constructor === Object) loc = this.normalize(loc).fullPath
    return this._url(loc)
  }

  normalize(loc) {
    if (loc.fullPath) return loc // normalized

    if (loc.constructor === String) loc = { path: loc }

    if (loc.external || /^\w+:\/\//.test(loc.path)) {
      loc.path = this._extractPathFromExternalURL(new URL(loc.path, 'file://'))
      delete loc.external
    }

    const url = new URL(loc.path, 'file://')
    if (loc.query) appendSearchParams(url.searchParams, loc.query)
    if (loc.hash) url.hash = loc.hash
    return Object.assign({ state: {} }, loc, {
      path: url.pathname,
      query: url.searchParams,
      hash: url.hash,
      fullPath: url.pathname + url.search + url.hash
    })
  }

  _getCurrentLocationFromBrowser() {
    const state = window.history.state || {}
    const loc = this.normalize(state.path || this._extractPathFromExternalURL(window.location))
    loc.state = state.state || {}
    if (state.path) loc.hidden = true
    return loc
  }

  /*
    init
    success: nop                       fail: _beforeChange('replace', current)       redirect: _beforeChange('replace', redirect)

    push
    success: pushState(to)             fail: nop                                     redirect: _beforeChange('push', redirect)

    replace
    success: replaceState(to)          fail: nop                                     redirect: _beforeChange('replace', redirect)

    popstate
    success: nop                       fail: __changeHistory('push', current)        redirect: _beforeChange('push', redirect)

    sessionless
    success: nop                       fail: nop                                     redirect: _beforeChange('sessionless', redirect)
  */
  _beforeChange(op, to) {
    // to is the same as current and op is push, set op to replace
    if (
      this.current
      && to.path === this.current.path && to.query.toString() === this.current.query.toString()
      && op === 'push') op = 'replace'

    Promise.resolve(this.beforeChange(to, this.current)).then(ret => {
      if (ret == null || ret === true) {
        if (op === 'push' || op === 'replace') this.__changeHistory(op, to)
        this.current = to
        this.change(to)
      } else if (ret.constructor === String || ret.constructor === Object) {
        if (op === 'init') op = 'replace'
        else if (op === 'popstate') op = 'push'
        this._beforeChange(op, this.normalize(ret))
      } else if (ret === false) {
        if (op === 'popstate') this.__changeHistory('push', this.current)
      }
    })
  }

  dispatch(to) {
    to = this.normalize(to)
    this._beforeChange('sessionless', to)
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
    to = this.normalize(to)
    if (to.silent) {
      this.__changeHistory(method, to)
      this.current = to
    } else {
      this._beforeChange(method, to)
    }
  }

  __changeHistory(method, to) {
    if (!SUPPORT_HISTORY_API) return

    const state = {}
    if (to.state) state.state = to.state

    let url = this._url(to.fullPath)
    if (to.hidden) {
      state.path = to.fullPath
      url = undefined
    }

    window.history[method + 'State'](Object.keys(state).length ? state : null, '', url)
  }

  go(n, { state = null, silent = false } = {}) {
    return new Promise((resolve, reject) => {
      if (!SUPPORT_HISTORY_API) return reject(new Error(SUPPORT_HISTORY_ERR))

      const onpopstate = () => {
        window.removeEventListener('popstate', onpopstate)
        window.addEventListener('popstate', this._onpopstate)

        const to = this._getCurrentLocationFromBrowser()

        if (state) {
          Object.assign(to.state, state)
          this.__changeHistory('replace', to)
        }

        if (silent) this.current = to
        else this._beforeChange('popstate', to)

        resolve()
      }

      window.removeEventListener('popstate', this._onpopstate)
      window.addEventListener('popstate', onpopstate)

      window.history.go(n)
    })
  }

  back(opts) {
    return this.go(-1, opts)
  }

  forward(opts) {
    return this.go(1, opts)
  }

  hookAnchorElements(container = document.body) {
    container.addEventListener('click', e => {
      const a = e.target.closest('a')

      // force not handle the <a> element
      if (!a || a.getAttribute('spa-history-skip') != null) return

      // open new window
      const target = a.getAttribute('target')
      if (
        target
        && (
          target === '_blank'
          || target === '_parent' && window.parent !== window
          || target === '_top' && window.top !== window
          || !(target in { _self: 1, _blank: 1, _parent: 1, _top: 1 }) && target !== window.name
        )
      ) return

      // out of app
      if (a.href.indexOf(location.origin + this.url('/')) !== 0) return

      const to = this.normalize(a.href)

      // hash change
      if (
        to.path === this.current.path
        && to.query.toString() === this.current.query.toString()
        && to.hash
        && to.hash !== this.current.hash) return

      e.preventDefault()
      this.push(to)
    })
  }
}
