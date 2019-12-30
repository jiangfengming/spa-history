# spa-history

A HTML5 history library for single-page application.

## Install

```
npm install spa-history
```

- [Constructor](#constructor)
  - [PathHistory](#pathhistory)
  - [HashHistory](#hashhistory)
- [Location object](#location-object)
  - [path](#path)
  - [external](#external)
  - [query](#query)
  - [hash](#hash)
  - [fullPath](#fullpath)
  - [url](#url)
  - [state](#state)
  - [hidden](#hidden)
  - [appearPath](#appearpath)
- [APIs](#apis)
  - [history.current](#historycurrent)
  - [history.start()](#historystart)
  - [history.normalize()](#historynormalize)
  - [history.url()](#historyurl)
  - [history.push()](#historypush)
  - [history.replace()](#historyreplace)
  - [history.dispatch()](#historydispatch)
  - [history.setState()](#historysetstate)
  - [history.go()](#historygo)
  - [history.back()](#historyback)
  - [history.forward()](#historyforward)
  - [history.captureLinkClickEvent()](#historycapturelinkclickevent)
- [Dependencies](#dependencies)
- [License](#license)

## Constructor

### PathHistory

```js
import { PathHistory } from 'spa-history'

const history = new PathHistory({
  // path of base directory. defaults to ''
  // If you want the root path doesn't contain ending slash,
  // you can set the base without ending slash, like '/app'
  base: '/app/',
  
  /*
    beforeChange() will be called before location change.

    Arguments:
      to: A normalized location object. The location will be changed to.
      from: A normalized location object. The current location.
      action: String. What action triggered the history change.
        push: history.push() is called.
        replace: history.replace() is called.
        pop: user clicked the back or forward button, or history.go(), history.back(), history.forward() is called, or hash changed.
        init: "to" is the initial page, at this stage, "from" is null.
        dispatch: history.dispatch() is called.

    Returns:
      true | undefined: The navigation is confirmed.
      false: Prevent the navigation.
      null: Do nothing.
      path | location object: Redirect to this location.
        You can override the history manipulate action by providing the `action` property, values are: 'push', 'replace', 'dispatch'.

    Return value can be a Promise.
  */
  beforeChange(to, from, action) {
  },

  /*
    afterChange() will be called after the location changed.

    Arguments:
      to: Location object. The location changed to.
  */
  afterChange(to, from, action) {
  }
})

history.start()
```

### HashHistory

```js
import { HashHistory } from 'spa-history'

const history = new HashHistory({
  beforeChange(to, from, action) {
  },

  afterChange(to, from, action) {
  }
})

history.start()
```

`HashHistory` has no `base` option.

## Location object
A location object is used for changing the current address.
It can be used in `history.start(location)`, `history.push(location)`, `history.replace(location)`, `history.dispatch(location)`, etc.

A string URL can be converted to a location object by [history.normalize()](#historynormalize).
 `to` and `from` parameter of `beforeChange` and `afterChange` hook are normalized location objects.

And a location object can be converted to a URL string by [history.url()](#historyurl).


```js
{
  path,
  external,
  query,
  hash,
  fullPath,
  url,
  state,
  hidden,
  appearPath
}
```

### path
`String`

SPA Internal path, which has stripped the protocol, host, and base path.

### external
`Boolean`

If `path` is started with protocal, or `external` is `true`,
`path` is treated as an external path, and will be converted to an internal path.

### query
`Object` | `String` | `Array` | `URLSearchParams` | `StringCaster<URLSearchParams>`

`query` accepts the same parameter types as [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams)
constructor. Or it can be a [StringCaster](https://github.com/jiangfengming/cast-string#stringcaster) object that wraps a `URLSearchParams` object.

### hash
`String`

A string containing a `#` followed by the fragment identifier of the URL.
If `HashHistory` is used, the fragment identifier is followed by the second `#` mark.

### fullPath
`String`. Read-only.

path + query string + hash

### url
`String`. Read-only.

An external relative URL which can be used as `href` attribute of `<a>`.
It is the same as `history.url(location)`.

* `PathHistory`: base + path + query string + hash
* `HashHistory`: # + path + query string + hash

### state
`Object`

The state object is a JavaScript object which is associated with the history entry.
See `state` parameter of [history.pushState()](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) for details.

### hidden
`Boolean`

Indicate whether it is a hidden history entry. see [history.push()](#historypush) for detail.

### appearPath
`String`

If `hidden` is `true` and `appearPath` is set, the location bar will show this address instead.

## APIs

### history.current
`Location object`

The current location. See [location object](#location-object).

### history.start()

```js
history.start(URL string | location)
```

Starts to handle the history.

In browser, if URL/location is not given, the default value is the current address.

### history.normalize()

```js
history.normalize(URL string | location)
```

Converts a URL string or an unnormalized location object to a normalized object.

If URL/location.path is started with protocal, or `location.external` is `true`, `location.path` is treated as an external path, and will be converted to an internal path.

```js
// PathHistory with base '/foo/bar/'
history.normalize('http://www.example.com/foo/bar/home?a=1#b')
/* ->
  {
    path: '/home',
    query: new StringCaster(new URLSearchParams('a=1')),
    hash: '#b',
    fullPath: '/home?a=1#b',
    url: '/foo/bar/home?a=1#b',
    state: {}
  }
*/

// same result as above
history.normalize({
  path: '/foo/bar/home?a=1#b',
  external: true
})

// same result as above
history.normalize('/home?a=1#b')

// same result as above
history.normalize({
  path: '/home',
  query: {
    a: 1
  },
  hash: '#b'
})

// HashHistory
history.normalize('http://www.example.com/app/#/home?a=1#b')
/* ->
  {
    path: '/home',
    query: new StringCaster(new URLSearchParams('a=1')),
    hash: '#b',
    fullPath: '/home?a=1#b',
    url: '#/home?a=1#b',
    state: {}
  }
*/
```

### history.url()

```js
history.url(URL string | location)
```

Converts a internal URL string or a location object to an external URL which can be used as `href` of `<a>`.

```js
history.url({
  path: '/home',
  query: {
    a: 1
  },
  hash: '#b'
})

// or
history.url('/home?a=1#b')

/*
  result:
  HashHistory: #/home?a=1#b
  PathHistory(with base: '/foo/bar/'): /foo/bar/home?a=1#b
*/
```

### history.push()

```js
history.push(URL string | location)
```

Pushs the location onto the history stack. `beforeChange` will be called.

```js
history.push('/home?a=1#b')

history.push({
  path: '/home',
  query: {
    a: 1
  },
  hash: '#b'
})

// PathHistory, complete URL
history.push('http://www.example.com/foo/bar/home?a=1#b')

// HashHistory, complete URL
history.push('http://www.example.com/#/home?a=1#b')
```

You can push a location with state.

```js
history.push({
  path: '/home',
  state: {
    foo: 1,
    bar: 2
  }
})
```

And you can push a hidden location, which will not change the value of browser's address bar.
the hidden location is stored in `window.history.state`.

```js
history.push({
  path: '/login',
  state: {
    foo: 1
  },

  // '/login' won't show in the location bar
  hidden: true,

  // optional. if set, the location bar will show this address instead
  appearPath: '/buy'
})
```

### history.replace()

```js
history.replace(URL string | location)
```

Replaces the current history entry with the provided URL/location.

### history.dispatch()

```js
history.dispatch(URL string | location)
```

Sets the current location to the provided URL/location without changing the history session.
That is, the location of browser's address bar won't change. `beforeChange` will be called.

### history.setState()

```js
history.setState(state)
```

Sets state of the current location. The state will be merged into `history.current.state`

### history.go()

```js
history.go(position, { silent = false, state = null } = {})
```

Counterpart of `window.history.go()`. Returns a promise which will be resolved when `popstate` event fired.

`silent`: If `true`, `beforeChange` won't be called.

`state`: If set, the state object will be merged into the state object of the destination location.

### history.back()

```js
history.back(options)
```

Same as `history.go(-1, options)`.

### history.forward()

```js
history.forward(options)
```

Same as `history.go(1, options)`.

### history.captureLinkClickEvent()

```js
history.captureLinkClickEvent(event)
```

Prevents the navigation when clicking the `<a>` element in the container and the `href` is an in-app address,
`history.push()` will be called instead.

```js
document.body.addEventListener('click', e => history.captureLinkClickEvent(e))
```

## Dependencies
- [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)
- [Object.assign()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [Element.closest()](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)

You can use [@babel/polyfill](https://babeljs.io/docs/en/babel-polyfill/) and
[dom4](https://github.com/WebReflection/dom4) to meet the requirements.

Or use the [polyfill.io](https://polyfill.io/) service:
```html
<script src="https://polyfill.io/v3/polyfill.min.js"></script>
```

## License
[MIT](LICENSE)
