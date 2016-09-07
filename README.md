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

  onHashChange(hash) {

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
- history.pop() -> Promise
- history.go(n) -> Promise
- history.back() -> Promise
- history.forward() -> Promise
- history.reload() -> history
- history.get(index) -> { id, path, query, hash, state }
- history.getAll() -> [{ id, path, query, hash, state }, ...]
- history.findById(id) -> { id, path, query, hash, state }
- history.findIndexById(id) -> Number
- history.findByPath(path) -> { id, path, query, hash, state }
- history.findIndexByPath(path) -> Number
- history.findLastByPath(path) -> { id, path, query, hash, state }
- history.findLastIndexByPath(path) -> Number
- history.setState(state, index = currentIndex, merge = false) -> history
- history.setStateById(state, id = currentId, merge = false) -> history
- history.mergeState(state, index = currentIndex) == history.setState(state, index, true)
- history.mergeStateById(state, id = currentId) == history.setStateById(state, id, true)

## Build
build dev
```
npm run build-dev
```
Open http://localhost:8010/

build dist
```
npm run build-dist
```

## License
MIT
