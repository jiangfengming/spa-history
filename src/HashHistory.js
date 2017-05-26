import Base from './Base'

export default class extends Base {
  _getCurrentPathFromBrowser() {
    return location.hash.slice(1) || '/'
  }

  _extractPathFromUrl(url) {
    url = new URL(url)
    return url.hash.slice(1) || '/'
  }

  _url(loc) {
    return loc === '/' ? location.pathname + location.search : '#' + loc
  }
}
