const { decodeEntities } = require('./utils')

const getApartmentType = (typeTitle) => {
  typeTitle = decodeEntities(typeTitle)
  if (typeTitle === 'Enkelrum, (rum i korridor)') {
    return 'dorm'
  } else if (typeTitle === 'Ett rum med pentry') {
    return 'room'
  } else if (
    typeTitle === 'Lägenhet 1 rum & kök' ||
    typeTitle === 'Lägenhet 2 rum & kök' ||
    typeTitle === 'Lägenhet 3 rum & kök' ||
    typeTitle === 'Lägenhet 4 rum & kök' ||
    typeTitle === 'Lägenhet 2 rum & pentry' ||
    typeTitle === 'Lägenhet 3 rum & pentry' ||
    typeTitle === 'Lägenhet 4 rum & pentry'
  ) {
    return 'apartment'
  } else {
    return null
  }
}

module.exports = {
  getApartmentType,
}
