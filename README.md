# spa-history

History APIs for SPA.


## Usage

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
```

### location object

```js
{
  path,
  query,
  hash,
  state,
  fullPath,
  hidden
}
```

### location.path


## APIs
- history.current
- history.url(URL string | location)
- history.normalize(URL string | location)
- history.push(URL string | location)
- history.replace(URL string | location)
- history.setState(state)
- history.go(position, options)
- history.back(position, options)
- history.forward(position, options)
- history.hookAnchorElements(container)


### history.current
  The current location

### history.url


## Dependencies
- URL
- Object.assign
- Element#closest

You can use <a href="http://babeljs.io/docs/usage/polyfill/">babel-polyfill</a> and <a href="https://github.com/WebReflection/dom4">dom4</a> to meet the requirements.

Or use the <a href="https://polyfill.io/">polyfill.io</a> service: https://cdn.polyfill.io/v2/polyfill.min.js?features=default,es6


## Build
```
npm run build
```


## License
MIT
