export function appendSearchParams(searchParams, q) {
  switch (q.constructor) {
    case Object:
      for (const name in q) searchParams.append(name, q[name])
      break
    case String:
      q = new URLSearchParams(q)
    case URLSearchParams: // eslint-disable-line
      q = Array.from(q)
    case Array: // eslint-disable-line
      for (const [name, value] of q) searchParams.append(name, value)
      break
  }
}
