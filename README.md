# managed-history

Operate the browser history like Array.

- history.length
- history.currentAt
- history.splice(start, deleteCount, ...insertItem)
- history.push(item)
- history.replace(item)
- history.pop()
- history.go(index)
- history.back()
- history.forward()
- history.filter(fn)


```js
let managedHistory = new ManagedHistory({
  mode: 'auto', // hash, html5, auto
});
```
