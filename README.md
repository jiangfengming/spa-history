# spa-history

Operate the browser history like Array.

- history.length -> Number
- history.items -> [...{ id, path, query, hash, state }]
- history.current -> { id, path, query, hash, state }
- history.currentIndex -> Number
- history.splice(start, deleteCount, ...insertItems) -> Promise
- history.push(...{ path, query, hash, state }) -> this
- history.replace({ path, query, hash, state }) -> this
- history.reset(...{ path, query, hash, state }) -> Promise
- history.pop() -> Promise
- history.go(n) -> Promise
- history.back() -> Promise
- history.forward() -> Promise
- history.findById(id) -> { id, path, query, hash, state }
- history.findIndexById(id) -> Number
- history.findByPath(path) -> { id, path, query, hash, state }
- history.findIndexByPath(path) -> Number
- history.findLastByPath(path) -> { id, path, query, hash, state }
- history.findLastIndexByPath(path) -> Number
- history.setState(state, index) -> this


```js
let spaHistory = new SpaHistory({
  mode: undefined, // html5, hashbang, undefined (auto fallback)
  base: '/',
  onLocationChange: function({ id, path, query, hash, state }) {

  },

  onHashChange: function() {

  }
});
```
