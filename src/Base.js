export default class {
  constructor({ base = '/' } = {}) {
    this.base = base
    this._id = 0

    if (!history.state || !history.state.state) history.pushState({ id: this.id++, state: {} })

    window.addEventListener('popstate', this._onpopstate)
  }

  _onpopstate() {
    const from = this.current

    this._beforeLeave().then(next => {
      if (next === true) {
        this.onLocationChange()
      } else if (next === false) {

      } else {

      }
    })
  }

  push(path, { query, hash, state = {}, slient = false } = {}) {
    history.pushState()
  }

  replace(path, { query, hash, state = {}, slient = false } = {}) {
  }

  reload() {

  }

  go(n, { slient = false, removeForwardHistory = false } = {}) {
    return this._go(n)
  }

  back(opts) {
    return this._go(-1, opts)
  }

  forward() {
    return this._go(1)
  }

  backTo(fn, { slient = false, offset = 0, removeForwardHistory = false } = {}) {

  }

  setState(state) {
  }

  _change(method, path, { query, state = {} } = {}) {

  }

  _dispatchEvent(name, ...args) {
    if (this[name]) {
      return new Promise(resolve => {
        // Invoking 'confirm()' during microtask execution is deprecated and will be removed in M53, around September 2016. See https://www.chromestatus.com/features/5647113010544640 for more details.
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
