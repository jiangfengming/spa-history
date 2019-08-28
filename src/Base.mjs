import { StringCaster } from 'cast-string'
import { appendSearchParams } from './util'

const SUPPORT_HISTORY_API = typeof window === 'object' && window.history && window.history.pushState
const SUPPORT_HISTORY_ERR = 'Current environment doesn\'t support History API'

export default class {
  constructor({ beforeChange = () => {}, afterChange }) {
    this.beforeChange = beforeChange
    this.afterChange = afterChange
    this.current = null
  }

  start(loc) {
    if (!loc && SUPPORT_HISTORY_API) {
      loc = this._getCurrentLocationFromBrowser()
    } else {
      loc = this.normalize(loc)
    }

    this._beforeChange('init', loc)

    if (SUPPORT_HISTORY_API) {
      this._onpopstate = () => {
        this._beforeChange('pop', this._getCurrentLocationFromBrowser())
      }

      window.addEventListener('popstate', this._onpopstate)
    }
  }

  url(loc) {
    return this.normalize(loc).url
  }

  normalize(loc) {
    if (loc.constructor === String) {
      loc = { path: loc }
    } else {
      loc = Object.assign({}, loc)
    }

    const hasOrigin = /^\w+:\/\//.test(loc.path)

    if (loc.external || hasOrigin) {
      loc.path = this._extractPathFromExternalURL(new URL(hasOrigin ? loc.path : 'http://a.a' + loc.path))
      delete loc.external
    }

    const url = new URL('http://a.a' + loc.path)

    if (loc.query) {
      appendSearchParams(url.searchParams, loc.query instanceof StringCaster ? loc.query.source : loc.query)
    }

    if (loc.hash) {
      url.hash = loc.hash
    }

    Object.assign(loc, {
      path: url.pathname,
      query: new StringCaster(url.searchParams),
      hash: url.hash,
      fullPath: url.pathname + url.search + url.hash,
      state: loc.state ? JSON.parse(JSON.stringify(loc.state)) : {} // dereferencing
    })

    loc.url = this._url(loc)

    return loc
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

    pop
    success: nop                       fail: __changeHistory('push', current)        redirect: _beforeChange('push', redirect)

    dispatch
    success: nop                       fail: nop                                     redirect: _beforeChange('dispatch', redirect)
  */
  _beforeChange(action, to) {
    // `to` is same as `current` and `action` is `push`, set `action` to `replace`
    if (
      this.current && to.path === this.current.path
      && to.query.source.toString() === this.current.query.source.toString() && action === 'push') {
      action = 'replace'
    }

    Promise.resolve(this.beforeChange(to, this.current, action)).then(ret => {
      if (ret === undefined || ret === true) {
        if (action === 'push' || action === 'replace') {
          this.__changeHistory(action, to)
        }

        this.current = to
        this.afterChange(to)
      }

      else if (ret === false) {
        if (action === 'popstate') {
          this.__changeHistory('push', this.current)
        }
      }

      // do nothing if returns null
      else if (ret === null) {
        return
      }

      else if (ret.constructor === String || ret.constructor === Object) {
        if (ret.action) {
          action = ret.action
        }

        else if (action === 'init') {
          action = 'replace'
        }

        else if (action === 'popstate') {
          action = 'push'
        }

        this._beforeChange(action, this.normalize(ret))
      }
    })
  }

  dispatch(to) {
    to = this.normalize(to)
    this._beforeChange('dispatch', to)
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
    Object.assign(this.current.state, JSON.parse(JSON.stringify(state))) // dereferencing
    this.__changeHistory('replace', this.current)
  }

  _changeHistory(action, to) {
    to = this.normalize(to)

    if (to.silent) {
      this.__changeHistory(action, to)
      this.current = to
    } else {
      this._beforeChange(action, to)
    }
  }

  __changeHistory(action, to) {
    if (!SUPPORT_HISTORY_API) {
      return
    }

    const state = {}

    if (to.state) {
      state.state = to.state
    }

    let url = to.url

    if (to.hidden) {
      state.path = to.fullPath
      url = to.appearPath && this.url(to.appearPath)
    }

    window.history[action + 'State'](Object.keys(state).length ? state : null, '', url)
  }

  go(n, { state = null, silent = false } = {}) {
    return new Promise((resolve, reject) => {
      if (!SUPPORT_HISTORY_API) {
        return reject(new Error(SUPPORT_HISTORY_ERR))
      }

      const onpopstate = () => {
        window.removeEventListener('popstate', onpopstate)
        window.addEventListener('popstate', this._onpopstate)

        const to = this._getCurrentLocationFromBrowser()

        if (state) {
          Object.assign(to.state, state)
          this.__changeHistory('replace', to)
        }

        if (silent) {
          this.current = to
        } else {
          this._beforeChange('pop', to)
        }

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

  captureLinkClickEvent(e) {
    const a = e.target.closest('a')

    // force not handle the <a> element
    if (!a || a.getAttribute('spa-history-skip') != null) {
      return
    }

    // open new window
    const target = a.getAttribute('target')

    if (
      target &&
      (
        target === '_blank'
        || target === '_parent' && window.parent !== window
        || target === '_top' && window.top !== window
        || !(target in { _self: 1, _blank: 1, _parent: 1, _top: 1 }) && target !== window.name
      )
    ) {
      return
    }

    // out of app
    if (!a.href.startsWith(location.origin + this.url('/'))) {
      return
    }

    const to = this.normalize(a.href)

    // hash change
    if (
      to.path === this.current.path
      && to.query.source.toString() === this.current.query.source.toString()
      && to.hash
      && to.hash !== this.current.hash) {
      return
    }

    e.preventDefault()
    this.push(to)
  }
}
