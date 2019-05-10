import Base from './Base'

export default class extends Base {
  constructor(args) {
    super(args)
    this.base = args.base || ''
  }

  _extractPathFromExternalURL(url) {
    let path = url.pathname

    if (this.base && this.base !== '/' && path.startsWith(this.base)) {
      path = path.replace(this.base, '')

      if (!path) {
        path = '/'
      } else if (this.base.endsWith('/')) {
        path = '/' + path
      }
    }

    return path + url.search + url.hash
  }

  _url(loc) {
    // if base is not end with /
    // do not append / if is the root path
    if (loc.path === '/' && this.base && !this.base.endsWith('/')) {
      return this.base + loc.fullPath.slice(1)
    }

    return (this.base && this.base.endsWith('/') ? this.base.slice(0, -1) : this.base) + loc.fullPath
  }
}
