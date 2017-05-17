import Base from './Base'

export default class extends Base {
  constructor({ onchange }) {
    super({ onchange })
    this._init()
  }

  _getCurrentPath() {
    return location.hash.slice(1) || '/'
  }

  _url(loc) {
    return loc === '/' ? location.pathname + location.search : '#' + loc
  }
}
