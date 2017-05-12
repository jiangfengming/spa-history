export function appendSearchParams(searchParams, q) {
  switch (q.constructor) {
    case Object:
      for (const name in q) searchParams.append(name, q[name])
      break
    case URLSearchParams:
      q = Array.from(q)
    case Array: // eslint-disable-line
      for (const { name, value } of q) searchParams.append(name, value)
      break
  }
}
