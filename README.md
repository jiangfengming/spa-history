# spa-history

A HTML5 history routing library for single-page application.


## Constructor

### HashHistory

```js
import HashHistory from 'spa-history/HashHistory'

const history = new HashHistory({
  /*
    beforeChange callback will be called at initializing and before location change.

    Arguments:
      to: The location will be changed to.
      from: The current location.

    Returns:
      true | undefined: The navigation is confirmed.
      false: Prevent the navigation.
      location: Redirect to this location. beforeChange will be called again.
  */
  beforeChange(to, from) {
  },

  /*
    change callback will be called when the location has been changed.

    Arguments:
      to: The location has been changed to.
  */
  change(to) {
  }
})

history.start()
```

### PathHistory

```js
import PathHistory from 'spa-history/PathHistory'

const history = new PathHistory({
  base: '/', // path of base directory. default: '/'

  beforeChange(to, from) {

  },

  change(to) {

  }
})

history.start()
```

### location object

```js
{
  path, // router internal path, which has stripped the protocol, host, and base path.
  query, // URLSearchParams object
  hash,
  state, // state object
  fullPath, // path + query + hash
  hidden // Boolean. Indicate whether it is a hidden history entry. see history.push() for detail.
}
```


## APIs
- [history.current](#historycurrent)
- [history.start(URL string | location)](#historystarturl-string--location)
- [history.normalize(URL string | location)](#historynormalizeurl-string--location)
- [history.url(URL String | location)](#historyurlurl-string--location)
- [history.push(URL string | location)](#historypushurl-string--location)
- [history.replace(URL string | location)](#historyreplaceurl-string--location)
- [history.dispatch(URL string | location)](#historydispatchurl-string--location)
- [history.setState(state)](#historysetstatestate)
- [history.go(position, { silent = false, state = null } = {})](#historygoposition--silent--false-state--null---)
- [history.back(position, options)](#historybackoptions)
- [history.forward(position, options)](#historyforwardoptions)
- [history.hookAnchorElements(container = document.body)](#historyhookanchorelementscontainer--documentbody)


### history.current
The current location. See location object.

### history.start(URL string | location)
Start the history router.

In browser, if URL/location is not given, the default value is the current address. This argument is mainly for server-side rendering.

### history.normalize(URL string | location)
convert the URL string or unnormalized location object to normalized object

if URL/location.path is started with protocal, or `location.external` is `true`, `location.path` is treated as an external path, and will be converted to an internal path.

```js
// PathHistory with base '/foo/bar/'
history.normalize('http://www.example.com/foo/bar/home?a=1#b')
/*
  {
    path: '/home',
    query: new URLSearchParams('a=1'),
    hash: '#b',
    fullPath: '/home?a=1#b',
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
// same result as above
history.normalize('http://www.example.com/app/#/home?a=1#b')
```

The `query` property can be of type Object, String and Array. see [URLSearchParams()](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams) for detail.

### history.url(URL string | location)
Convert the internal URL string or location object to an external URL which can be used in `href` attribute of `<a>`.

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

### history.push(URL string | location)
Counterpart of `window.history.pushState()`. Push the location onto the history stack. `beforeChange` will be called.

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
history.push(
  path: '/home',
  state: {
    foo: 1,
    bar: 2
  }
)
```

And you can push a hidden location, which will not change the value of browser's address bar. the hidden location is stored in `window.history.state`

```js
history.push(
  path: '/login',
  state: {
    foo: 1
  },
  hidden: true
)
```

### history.replace(URL string | location)
Counterpart of `window.history.replaceState()`. Replace the current history entry with the location.

### history.dispatch(URL string | location)
Dispatch the navigation events and set the current location without changing the history session.

### history.setState(state)
Set state of the current location. the state will be merged into `history.current.state`

### history.go(position, { silent = false, state = null } = {})
Counterpart of `window.history.go()`. Returns a promise which will be resolved when `popstate` event fired.

`silent`: if `true`, `beforeChange` won't be called.

`state`: if set, the state object will be merged into the state object of the destination location.

### history.back(options)
Same as `history.go(-1, options)`

### history.forward(options)
Same as `history.go(1, options)`

### history.hookAnchorElements(container = document.body)
Prevent the navigation when clicking the `<a>` element in the container and the `href` is an in-app address, `history.push()` will be called instead.


## Dependencies
- [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)
- [Object.assign()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [Element.closest()](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)

You can use <a href="http://babeljs.io/docs/usage/polyfill/">babel-polyfill</a> and <a href="https://github.com/WebReflection/dom4">dom4</a> to meet the requirements.

Or use the <a href="https://polyfill.io/">polyfill.io</a> service:
```html
<script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
```

## Build
```
npm run build
```


## License
MIT
