export default class {
  constructor({ onchange }) {
    this.onchange = onchange
  }

  _init() {
    if (!history.state || !history.state.state) history.replaceState({ state: {} }, '')
    this.current = this._parse('/')
    const to = this._parse(history.state.path || this.getCurrentLocation())
    to.state = history.state.state
    if (history.state.path) to.hidden = true
    window.addEventListener('popstate', this._onpopstate)
  }

  _parse(url) {
    url = new URL(url, 'file://')
    return {
      path: url.pathname,
      query: url.searchParams,
      hash: url.hash
    }
  }

  _dispatchChangeEvent(to) {
    if (to === this.current)
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
    const to =
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
  push(to) {
    if (to.constructor === String) {

      to = this._parse(to)
    } else {

    }

    const state = { state: to.state }
    if (to.hidden) {
      state.path = fullPath
      url = this.url(to)
    }

    history.pushState({ state: to.state }, '',  )
    this._dispatchChangeEvent(to)
  }

  replace(to) {
  }

  go(n) {
    return history.go(n)
  }

  back() {
    return history.back()
  }

  forward() {
    return history.forward()
  }

  backTo(fn, { slient = false, offset = 0 } = {}) {

  }

  setState(state) {
  }
}
