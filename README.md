# spa-history

Operate the browser history like Array.

- history.length -> Number
- history.current -> { id, path, query, hash, state }
- history.currentIndex -> Number
- history.goto({ path, query, hash, state }) -> promise
- history.splice(start, deleteCount, ...insertItems) -> Promise
- history.push(...{ path, query, hash, state }) -> Promise
- history.replace({ path, query, hash, state }) -> Promise
- history.reset(...{ path, query, hash, state }) -> Promise
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
- history.setState(state, index = currentIndex) -> history
- history.setStateById(state, id = currentId) -> history


```js
let spaHistory = new SpaHistory({
  mode: undefined, // html5, hashbang. default: undefined (auto fallback)
  base: '/', // default: /

  onNavigate: function({ id, path, query, hash, state }) {

  },

  onHashChange: function(hash) {

  }
});
```


## License
MIT
