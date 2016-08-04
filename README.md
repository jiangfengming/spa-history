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
- history.back()
- history.forward()
- history.findById(id)
- history.findByPath(path)
- history.findLastByPath(path)
- history.findAllByPath(path)
- history.setState(state, id)


```js
let spaHistory = new SpaHistory({
  mode: 'auto', // hash, html5, auto
  base: '/app/',
  onNavigate: function({ path, query, hash, state }) {

  }
});
```
