import Base from './Base'
import { appendSearchParams } from './util'

export default class extends Base {
  constructor({ base = '/', onchange }) {
    super({ onchange })
    this.base = base
    this._init()
  }

  getCurrentLocation() {
    return location.pathname.replace(this.base, '/') + location.search + location.hash
  }

  url(loc) {
    if (loc.constructor === Object) {
      const url = new URL(loc.path, 'file://')
      if (loc.query) appendSearchParams(url.searchParams, location.query)
      if (loc.hash) url.hash = loc.hash
      loc = url.pathname + url.search + url.hash
    }
    return this.base + loc.slice(1)
  }
}
