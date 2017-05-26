import Base from './Base'

export default class extends Base {
  constructor(args) {
    super(args)
    this.base = args.base || '/'
  }

  _getCurrentPathFromBrowser() {
    return location.pathname.replace(this.base, '/') + location.search + location.hash
  }

  _extractPathFromUrl(url) {
    url = new URL(url)
    return url.pathname.replace(this.base, '/') + url.search + url.hash
  }

  _url(loc) {
    return this.base + loc.slice(1)
  }
}
