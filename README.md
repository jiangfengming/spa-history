# spa-history

Operate the browser history like Array.

- history.length
- history.items
- history.current -> { path, query, hash, state }
- history.splice(start, deleteCount, ...insertItems)
- history.push(...{path, query, hash, state})
- history.replace(path, query, hash, state)
- history.reset(...{path, query, hash, state})
- history.pop()
- history.go(n)
- history.goById(id)
- history.goByIndex(index)
- history.back()
- history.forward()
- history.findById(id) -> { index, value }
- history.findByPath(path) -> { index, value }
- history.findLastByPath(path) -> { index, value }
- history.findAllByPath(path) -> [...{ index, value }]
- history.setState(state, index)
- history.setStateById(state, id)


```js
let spaHistory = new SpaHistory({
  mode: 'auto', // hash, html5, auto
  base: '/app/',
  onNavigate: function({ path, query, hash, state }) {

  }
});
```
