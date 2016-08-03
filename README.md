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
- history.goByIndex(index)
- history.goBySid(sid)
- history.back()
- history.forward()
- history.get(index) -> { path, query, hash, state }
- history.findBySid(sid)
- history.findByPath(path)
- history.getCurrentIndex() -> index
- history.setState(state, index = currentIndex)


```js
let spaHistory = new SpaHistory({
  mode: 'auto', // hash, html5, auto
  base: '/app/',
  onNavigate: function(path, state, index) {

  }
});
```
