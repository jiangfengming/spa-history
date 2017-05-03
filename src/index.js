import url from 'url-x'
import hashbangMode from './hashbang'
import pathnameMode from './pathname'

export default class {
  constructor({ mode = 'hashbang', base = '/', beforeNavigate, onNavigate, onHashChange } = {}) {
    this.mode = mode
    const mixin = this.mode === 'hashbang' ? hashbangMode : pathnameMode

    for (const method in mixin) this[method] = mixin[method]

    if (base.slice(-1) !== '/') {
      this.base = base + '/'
      this._baseNoTrailingSlash = base
    } else {
      this.base = base
      this._baseNoTrailingSlash = base.slice(0, -1)
    }

    this.beforeNavigate = beforeNavigate
    this.onNavigate = onNavigate
    this.onHashChange = onHashChange
  }

  push(path, { query, state = {}, triggerEvents = true } = {}) {

  }

  replace(path, { query, state = {}, triggerEvents = true } = {}) {
  }

  reload() {

  }

  go(n, { triggerEvents = true, removeForwardHistory = false } = {}) {
    return this._go(n)
  }

  back(opts) {
    return this._go(-1, opts)
  }

  forward() {
    return this._go(1)
  }

  backTo(fn, { triggerEvents = true, offset = 0, removeForwardHistory = false } = {}) {

  }

  setState(state) {
  }

  _change(method, url) {
  }

  // Invoking 'confirm()' during microtask execution is deprecated and will be removed in M53, around September 2016. See https://www.chromestatus.com/features/5647113010544640 for more details.
  _dispatchEvent(name, ...args) {
    if (this[name]) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(this[name](...args))
        })
      })
    } else {
      return Promise.resolve(true)
    }
  }

  _hookAClick() {
    document.body.addEventListener('click', e => {
      const a = e.target.closest('a')

      if (!a || a.getAttribute('spa-history-skip') != null) {
        return
      }

      let url = new Url(a.href)
      const base = new Url(this.base)
      if (url.href.indexOf(base.href) !== 0) {
        return
      }

      const target = a.getAttribute('target')
      if (target && (target === '_blank' || target === '_parent' && window.parent !== window || target === '_top' && window.top !== window || !(target in { _self: 1, _blank: 1, _parent: 1, _top: 1 }) && target !== window.name)) {
        return
      }

      e.preventDefault()
      url = this._parseUrl(url.href)
      this.goto(url.href)
    })
  }
}
