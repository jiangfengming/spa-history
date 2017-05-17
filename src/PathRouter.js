import Base from './Base'

export default class extends Base {
  constructor({ base = '/', onchange }) {
    super({ onchange })
    this.base = base
    this._init()
  }

  _getCurrentPath() {
    return location.pathname.replace(this.base, '/') + location.search + location.hash
  }

  _url(loc) {
    return this.base + loc.slice(1)
  }
}
