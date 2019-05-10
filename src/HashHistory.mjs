import Base from './Base'

export default class extends Base {
  _extractPathFromExternalURL(url) {
    return url.hash.slice(1) || '/'
  }

  _url(loc) {
    return loc.fullPath === '/' ? location.pathname + location.search : '#' + loc.fullPath
  }
}
