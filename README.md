# spa-history

A rewritable and stateful browser history.

Note: can only be used within a single-page application.

## Usage
```js
let spaHistory = new SpaHistory({
  mode: undefined, // html5, hashbang. default: undefined (auto fallback)
  base: '/path/to/app/', // default: /

  onNavigate({ id, path, query, hash, state }, isReload) {

  },

  beforeNavigate(toLocation, isReload) {

  },

  onHashChange(newHash, oldHash) {

  }
});
```

## APIs
- history.length -> Number
- history.current -> { id, path, query, hash, state }
- history.currentIndex -> Number
- history.goto({ path, query, hash, state }) -> Promise
- history.splice(start, deleteCount, ...insertItems) -> Promise
- history.push({ path, query, hash, state }, ...) -> Promise
- history.replace({ path, query, hash, state }) -> Promise
- history.reset({ path, query, hash, state }, ...) -> Promise
- history.url({ path, query, hash }) -> String. URL
- history.pop() -> Promise
- history.go(n) -> Promise
- history.back() -> Promise
- history.forward() -> Promise
- history.reload() -> Promise
- history.get(index) -> { id, path, query, hash, state }
- history.getAll() -> [{ id, path, query, hash, state }, ...]
- history.findById(id) -> { id, path, query, hash, state }
- history.findIndexById(id) -> Number
- history.findByPath(path) -> { id, path, query, hash, state }
- history.findIndexByPath(path) -> Number
- history.findLastByPath(path) -> { id, path, query, hash, state }
- history.findLastIndexByPath(path) -> Number
- history.setState(state, index = currentIndex, merge = false) -> Boolean
- history.setStateById(state, id = currentId, merge = false) -> Boolean
- history.mergeState(state, index = currentIndex) == history.setState(state, index, true)
- history.mergeStateById(state, id = currentId) == history.setStateById(state, id, true)


## Dependencies
- Object.assign
- Element#closest
- Array#findIndex

You can use <a href="http://babeljs.io/docs/usage/polyfill/">babel-polyfill</a> and <a href="https://github.com/WebReflection/dom4">dom4</a> to meet the requirements.

Or use the <a href="https://polyfill.io/">polyfill.io</a> service: https://cdn.polyfill.io/v2/polyfill.min.js?features=default,es6

## Development
```
npm run dev
```

### Examples:
- auto mode: http://localhost:8010/
- hashbang: http://localhost:8010/hashbang
- hashbang only (disable history state API): http://localhost:8010/hashbang-only

### Auto location conversion
Location will be auto converted to browser supported mode.

e.g., if you open http://127.0.0.1:8010/product in IE9, the location will be replaced with http://127.0.0.1:8010/#!/product with state ID appended,
and vice versa, if you open http://127.0.0.1:8010/#!/product in Chrome, the location will be replaced with http://127.0.0.1:8010/product

## Build
```
npm run build
```

## License
MIT
