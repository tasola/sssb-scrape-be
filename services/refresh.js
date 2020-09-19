const { scrapeApartments } = require('./scrape')
const { checkIfNewRelease } = require('./analyze')

// The server restarts once every 24h. When this happens the server's prev is
// empty, and the first scrape is always interpreted as a new release. Count
// the servers scrapes and ignore that first case when prev is empty.
// This variable is set to 1 in order to trigger a mailing action on a local
// environment for testing purposes.
let refreshCounter = process.env.NODE_ENV !== 'production' ? 1 : 0
let doEmail = false

let savedApartments = []
const refreshTimer =
  process.env.NODE_ENV !== 'production' ? 1000 * 10 : 1000 * 60 * 5

const updateApartments = () => {
  refreshCounter++
  doEmail = refreshCounter > 1
  const result = scrapeApartments()
    .then((apartments) => {
      savedApartments = checkIfNewRelease(savedApartments, apartments, doEmail)
      return apartments
    })
    .catch((err) => console.error('Error in updateApartments', err))
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
    .catch((err) => console.error('Error in timedUpdate', err))
}

module.exports = {
  updateApartments: updateApartments,
  timedUpdate: timedUpdate,
}
