# spa-history

Operate the browser history like Array.

- history.length
- history.items
- history.current -> { id, path, query, hash, state }
- history.splice(start, deleteCount, ...insertItems)
- history.push(...{ path, query, hash, state })
- history.replace({ path, query, hash, state })
- history.reset(...{ path, query, hash, state })
- history.pop()
- history.go(n)
- history.goByIndex(index)
- history.back()
- history.forward()
- history.findById(id) -> { id, path, query, hash, state }
- history.findIndexById(id) -> index
- history.findByPath(path) -> { id, path, query, hash, state }
- history.findIndexByPath(path) -> index
- history.findLastByPath(path) -> { id, path, query, hash, state }
- history.findLastIndexByPath(path) -> index
- history.getCurrentIndex() -> index
- history.setState(state, index)


```js
let spaHistory = new SpaHistory({
  mode: 'auto', // hash, html5, auto
  base: '/app/',
  onLocationChange: function({ id, path, query, hash, state }) {

  }
});
```
