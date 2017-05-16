import Base from './Base'
import { appendSearchParams } from './util'

export default class extends Base {
  constructor({ onchange }) {
    super({ onchange })
    this._init()
  }

  getCurrentLocation() {
    return location.hash.slice(1) || '/'
  }

  url(loc) {
    if (loc.constructor === Object) {
      const url = new URL(loc.path, 'file://')
      if (loc.query) appendSearchParams(url.searchParams, location.query)
      if (loc.hash) url.hash = loc.hash
      loc = url.pathname + url.search + url.hash
    }
    return loc === '/' ? location.pathname + location.search : '#' + loc
  }
}
