import Url from 'browser-url';

export default class {
  constructor() {
    // props
    this.length = 0;
    this.current = null;
    this.canUseHistoryAPI = history.pushState && location.protocol.indexOf('http') == 0;

    this._nativeLength = history.length;

  }

  splice() {}

  push() {}

  replace() {}

  reset() {}

  pop() {}

  go() {}

  back() {}

  forward() {}

  get() {}

  setState() {}
}
