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








  push(...locations) {
    if (this._cursor !== this._session.length - 1) {
      this._session = this._session.slice(0, this._cursor + 1)
    }

    let promise = Promise.resolve()
    locations.forEach(location => {
      const url = this._locationToUrl(location)
      this._setSession(url)
      promise = promise.then(() => this._change('push', url))
    })

    return promise.then(() => {
      this._setCurrentItem(this._session.length - 1)
      this._saveData()
    })
  }

  replace(location) {
    const url = this._locationToUrl(location)
    return this._change('replace', url)
  }

  goto(location) {
    const to = this._locationToUrl(location)
    const current = this._locationToUrl(this.current)

    if (to.pathname + to.search !== current.pathname + current.search) { // different location
      return this._dispatchEvent('beforeNavigate', this._urlToLocation(to), false).then(bool => {
        if (bool !== false) {
          return this.push(to).then(() => this._dispatchEvent('onNavigate', this.current, false))
        }
      })
    } else { // same location
      if (to.hash) {
        if (to.hash === this.current.hash) { // hash not changed
          return Promise.resolve(false)
        } else { // hash changed
          to.id = this._getStateId(this.current.id) + '-' + this._uniqueId()
          return this.push(to).then(() => this._dispatchEvent('onHashChange', to.hash, current.hash))
        }
      } else { // nothing changed, and no hash. reload
        return this._dispatchEvent('beforeNavigate', this._urlToLocation(to), true).then(bool => {
          if (bool !== false) {
            if (this.current.hash) { // current location has hash
              to.id = this._getStateId(this.current.id) + '-' + this._uniqueId()
              return this.push(to).then(() => this._dispatchEvent('onNavigate', this.current, true))
            } else {
              return this._dispatchEvent('onNavigate', this.current, true)
            }
          }
        })
      }
    }
  }

  reload() {
    return this._dispatchEvent('onNavigate', this.current, true)
  }

  pop() {
    return this.splice(this._session.length - 1, 1)
  }

  go(n) {
    return this._go(n)
  }

  back() {
    return this._go(-1)
  }

  forward() {
    return this._go(1)
  }

  setState(state, index, merge) {
    if (index == null) {
      return this.setStateById(state, null, merge)
    } else if (this._session[index]) {
      return this.setStateById(state, this._session[index].id, merge)
    } else {
      return false
    }
  }

  _change(method, url) {
    return this._changeHistory(method, url).then(() => {
      if (url.title) {
        document.title = url.title
      }
    })
  }

  _locationToUrl(location) {
    // already formatted
    if (location.pathname) {
      return location
    }

    if (location.constructor === String) {
      return new Url(location).sortQuery()
    }

    const url = new Url(location.path).addQuery(location.query).sortQuery()
    if (location.hash) {
      url.hash = location.hash
    }

    url.title = location.title
    url.state = location.state
    url.id = location.id
    return url
  }

  _urlToLocation(url) {
    return {
      id: url.id,
      path: url.pathname,
      query: url.query,
      hash: url.hash,
      state: url.state
    }
  }

  _uniqueId() {
    return Math.random().toString(16).slice(2, 8)
  }

  _setSession(url, index) {
    if (index == null) {
      index = this._session.length
    }

    if (!url.id) {
      url.id = this._sessionId + '-' + this._uniqueId()
    }

    this._session[index] = {
      id: url.id,
      path: url.pathname,
      query: url.query,
      hash: url.hash
    }

    if (url.state != null) {
      this.setStateById(url.state, url.id)
    }
  }

  /*
  {
    sessions: [
      [
        { id, path, query, hash }, ...
      ],
      ...
    ],

    states: {
      id: { },
      ...
    }
  }
  */
  _saveData() {
    this._data.sessions[this._sessionId] = this._session
    sessionStorage.setItem('_spaHistory', JSON.stringify(this._data))
  }

  _readData() {
    return JSON.parse(sessionStorage.getItem('_spaHistory'))
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

  _onNavigate() {
    const toId = this._getCurrentId()
    if (toId === 'PLACEHOLDER') {
      this._disableEvent()
      this.back().then(() => {
        this._enableEvent()
      })
    } else {
      const lastStateId = this._getStateId(this.current.id)
      const toStateId = this._getStateId(toId)
      const toIndex = this.findIndexById(toId)
      const to = this.get(toIndex)
      const current = this.current
      if (lastStateId === toStateId) {
        this._setCurrentItem(toIndex)
        this._dispatchEvent('onHashChange', to.hash, current.hash)
      } else {
        this._disableEvent()
        const steps = toIndex - this.currentIndex
        this.go(-steps).then(() => {
          this._dispatchEvent('beforeNavigate', to, false).then(bool => {
            if (bool !== false) {
              return this.go(steps).then(() => {
                this._enableEvent()
                this._setCurrentItem(toIndex)
                return this._dispatchEvent('onNavigate', this.current, false)
              })
            } else {
              this._enableEvent()
            }
          })
        })
      }
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
