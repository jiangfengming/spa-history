import Base from './Base'

export default class extends Base {
  constructor(args) {
    super(args)
    this.base = args.base || '/'
  }

  _extractPathFromExternalURL(url) {
    return url.pathname.replace(this.base, '/') + url.search + url.hash
  }

  _url(loc) {
    return this.base + loc.slice(1)
  }
}
