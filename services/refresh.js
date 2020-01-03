const { scrapeApartments } = require('./scrape')
const { checkIfNewRelease } = require('./analyze')

let savedApartments = []
const refreshTimer =
  process.env.NODE_ENV !== 'production' ? 1000 * 30 : 1000 * 60 * 5

const updateApartments = () => {
  const result = scrapeApartments().then(apartments => {
    savedApartments = checkIfNewRelease(savedApartments, apartments)
    return apartments
  })
  return result
}

const timedUpdate = () => {
  updateApartments()
    .then(() => {
      console.log('Process finished, waiting for refresh')
      setTimeout(() => {
        console.log('Refreshing...')
        timedUpdate()
      }, refreshTimer)
    })
    .catch(err => console.error('Error in timedUpdate', err))
}

module.exports = {
  updateApartments: updateApartments,
  timedUpdate: timedUpdate
}
