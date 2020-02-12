const getApartmentType = typeTitle => {
  switch (typeTitle) {
    case 'Enkelrum, (rum i korridor)':
      return 'dorm'
    case 'Ett rum med pentry':
      return 'room'
    case 'Lägenhet 1 rum & kök' ||
      'Lägenhet 2 rum & kök' ||
      'Lägenhet 3 rum & kök' ||
      'Lägenhet 4 rum & kök':
      return 'apartment'
    case 'Lägenhet 2 rum & pentry' ||
      'Lägenhet 3 rum & pentry' ||
      'Lägenhet 4 rum & pentry':
      return 'apartment'
    default:
      return ''
  }
}

module.exports = {
  getApartmentType
}
