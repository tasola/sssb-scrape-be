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

// Returns the floor based on the apartment number. As of 2020-02-12 the second
// number in the apartment number is the floor, if the first number is 1. If the
// first number is something else, it implies that the floor is on it's tenths:
// 1011 -> Floor 0
// 1912 -> Floor 9
// 2012 -> Floor 10
// 3201 -> Floor 22
// A special case is Nyponet, where the result is off by 4, such that 1011 would
// be Floor 4. As of 2020-02-12 the author is unaware how floors under 4 are handled
const getFloorFromAdress = (adress, area) => {
  const apartmentNumber = adress.slice(-4)
  const isNyponet = area === 'Nyponet'
  let floor
  if (apartmentNumber[0] === '1') {
    floor = apartmentNumber[1]
  } else {
    floor = (parseInt(apartmentNumber[0]) - 1).toString() + apartmentNumber[1]
  }
  if (isNyponet) floor = (parseInt(floor) + 4).toString()
  return floor
}

const decodeEntities = encodedString => {
  var translate_re = /&(nbsp|amp|quot|lt|gt);/g
  var translate = {
    nbsp: ' ',
    amp: '&',
    quot: '"',
    lt: '<',
    gt: '>'
  }
  return encodedString
    .replace(translate_re, (match, entity) => {
      return translate[entity]
    })
    .replace(/&#(\d+);/gi, (match, numStr) => {
      const num = parseInt(numStr, 10)
      return String.fromCharCode(num)
    })
}

module.exports = {
  arraysOfObjectsAreSame: arraysOfObjectsAreSame,
  objectsAreSame,
  removeLeadingZeroFromString,
  getFloorFromAdress,
  decodeEntities
}
