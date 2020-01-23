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
      return false
    }
  }
  return true
}

const removeLeadingZeroFromString = string => {
  const _string = string.toString()
  if (_string.length > 1 && _string[0] === '0') return _string.substr(1)
  return _string
}

module.exports = {
  arraysOfObjectsAreSame: arraysOfObjectsAreSame,
  objectsAreSame,
  removeLeadingZeroFromString
}
