const doNotLog = process.env.NODE_ENV === 'test'
const separator = '----------------------------------'

const isThisANewRelease = (bool, prev, curr) => {
  if (doNotLog) return
  console.log(separator)
  if (bool) {
    console.log('The newly scraped object is identical to the previous one')
  } else {
    console.log('The newly scraped object is DIFFERENT than the last one!')
  }
  logPrevAndCurr(prev, curr)
  console.log(separator)
}

const handleEmptyCurrentBatch = (prev, curr) => {
  if (doNotLog) return
  console.log(separator)
  console.log(
    'The CURRENT batch is empty. Either the scraped site is down, or it has slow response times or similar.'
  )
  console.log(
    ' This log should be followed by an indication that the previous batch was empty'
  )
  logPrevAndCurr(prev, curr)
  console.log(
    'Attempting to kill this process and call updateApartments() from scratch...'
  )
  console.log(separator)
}

const handleEmptyPreviousBatch = (prev, curr) => {
  if (doNotLog) return
  console.log(separator)
  console.log(
    'The PREVIOUS batch is empty. This usually indicates that the server has restarted because no data was returned from the scraped site'
  )
  console.log('No action is taken. Waiting for the next scrape cycle...')
  console.log(separator)
}

const handleNewRelease = (prev, curr, amountOfShortTerms) => {
  if (doNotLog) return
  console.log(separator)
  console.log('New apartments have been detected.')
  console.log(
    'When comparing prev and curr, ' +
      amountOfShortTerms +
      ' new apartments were found in curr.'
  )
}

const handleShortTerms = shortTerms => {
  if (doNotLog) return
  console.log(
    'Between the objects above, the following objects were assessed as short terms: '
  )
  shortTerms.forEach(s => console.log(s))
  console.log(separator)
}

const handleNewFlush = () => {
  if (doNotLog) return
  console.log(
    'Between the objects above, no objects were assessed as short terms. Instead, a whole new flush is presumed. '
  )
  console.log(separator)
}

const emailSubscribers = () => console.log('Emailing subscribers...')

const emailAdmins = () => console.log('Emailing admins...')

const logPrevAndCurr = (prev, curr) => {
  if (doNotLog) return
  console.log(' ')
  console.log('The previous batch:')
  printAdresses(prev)
  console.log(' ')
  console.log('The current batch:')
  printAdresses(curr)
  console.log(' ')
}

const printAdresses = arrayOfObjects => {
  let adresses = ''
  arrayOfObjects.forEach(ap => {
    adresses += ap.adress + ', '
  })
  if (adresses === '') adresses = '[empty]'
  console.log(adresses)
}

module.exports = {
  isThisANewRelease,
  handleEmptyCurrentBatch,
  handleEmptyPreviousBatch,
  handleNewRelease,
  handleShortTerms,
  handleNewFlush,
  emailSubscribers,
  emailAdmins
}
