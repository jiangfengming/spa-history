export default class {
  constructor({ base = '/', onchange } = {}) {
    this.base = base
    this.onchange = onchange

    if (!history.state || !history.state.state) history.replaceState({ state: {} }, '')

    this.current = this.parse('/')
    const to = this.parse(history.state.path || this.getCurrentLocation())
    to.state = history.state.state
    if (history.state.path) to.hidden = true
    this._triggerChangeEvent(to)

    window.addEventListener('popstate', this._onpopstate)
  }

  parse(url) {
    url = new URL(url, 'file://')
    return {
      path: url.pathname.replace(this.base, '/'),
      query: url.searchParams,
      hash: url.hash
    }
  }

  url(loc) {
    if (loc.constructor === String) {
      return this.base + loc.slice(1)
    } else {
      const url = new URL(loc.path, 'file://')
      if (loc.query) appendSearchParams(url.searchParams, location.query)
      if (loc.hash) url.hash = loc.hash
      return this.base + url.pathname.slice(1) + url.search + url.hash
    }
  }

  _triggerChangeEvent(to) {
    Promise.resolve(this.onchange(this.current, to)).then(res => {
      if (res === true || res === undefined) {
        this.current = to
      } else if (res === false) {

      } else {
        this.push(res)
      }
    })
  }

  _onpopstate() {
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
    let url
    if (to.constructor === String) {
      to = this.parse(to)
    } else {

    }

    const state = { state: to.state }
    if (to.hidden) {
      state.path = fullPath
      url = this.url(to)
    }
    history.pushState({ state: to.state }, '', to)
    this._triggerChangeEvent(to)
  }

  replace(path, { query, hash, state = {}, slient = false } = {}) {
  }

  reload() {

  }

  go(n, { slient = false } = {}) {
    return this._go(n)
  }

  back(opts) {
    return this._go(-1, opts)
  }

  forward() {
    return this._go(1)
  }

  backTo(fn, { slient = false, offset = 0 } = {}) {

  }

  setState(state) {
  }
}
