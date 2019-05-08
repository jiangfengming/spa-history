import Base from './Base'

export default class extends Base {
  constructor(args) {
    super(args)
    this.base = args.base || '/'
  }

  _extractPathFromExternalURL(url) {
    let path = url.pathname

    if (path.startsWith(this.base)) {
      path = path.replace(this.base, '')

      if (path[0] !== '/') {
        path = '/' + path
      }
    }

    return path + url.search + url.hash
  }

  _url(loc) {
    return this.base + (this.base.slice(-1) === '/' ? loc.slice(1) : loc)
  }
}
