# spa-history

Operate the browser history like Array.

- history.length
- history.current -> { path, state, index }
- history.splice(start, deleteCount, ...insertItems)
- history.push(path, state)
- history.replace(path, state)
- history.reset(...items)
- history.pop()
- history.go(n)
- history.back()
- history.forward()
- history.get(n) -> { path, state, index }
- history.setState(state, n = history.current.index)


```js
let spaHistory = new SpaHistory({
  mode: 'auto', // hash, html5, auto
  base: '/app',
  onNavigate: function(path, state, index) {

  }
});
```
