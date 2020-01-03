const arraysOfObjectsAreSame = (prev, curr) => {
  if (prev.length !== curr.length) return false
  for (let i = 0; i < prev.length; i++) {
    if (!objectsAreSame(prev[i], curr[i])) {
      return false
    }
  }
  return true
}

// Compare two objects. Excludes the attribute "queue" and "link"
// as they can change without changing apartment
const objectsAreSame = (x, y) => {
  for (let propertyName in x) {
    if (
      propertyName !== 'queue' &&
      propertyName !== 'link' &&
      x[propertyName] !== y[propertyName]
    ) {
      console.log('----')
      console.log(x[propertyName])
      console.log('is not equal to')
      console.log(y[propertyName])
      console.log('----')
      return false
    }
  }
  return true
}

module.exports = {
  arraysOfObjectsAreSame: arraysOfObjectsAreSame
}
