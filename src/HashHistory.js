import Base from './Base'

export default class extends Base {
  constructor(args) {
    super(args)
    this._init()
  }

  _getCurrentPath() {
    return location.hash.slice(1) || '/'
  }

  _url(loc) {
    return loc === '/' ? location.pathname + location.search : '#' + loc
  }
}
