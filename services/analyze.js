const { arraysOfObjectsAreSame } = require('../utils/utils')
const { updateApartments } = require('../services/refresh')
const log = require('../utils/log')

// TODO: Extract this?
const mailUtils = require('../utils/mail.js')

const checkIfNewRelease = (prev, curr) => {
  const areArraysIdentical = arraysOfObjectsAreSame(prev, curr)
  log.isThisANewRelease(areArraysIdentical, prev, curr)
  if (!areArraysIdentical) {
    return handlePotentialNewRelease(prev, curr)
  }
  return curr
}

const handlePotentialNewRelease = (prev, curr) => {
  if (prev.length === 0) {
    handleEmptyPreviousBatch(prev, curr)
  }
  if (curr.length === 0) {
    return handleEmptyCurrentBatch(prev, curr)
  } else {
    handleNewRelease(prev, curr)
  }
  return curr
}

// If zero apartments are in prev, it usually means that the scraper has restarted the
// process due to circumstances described in handleEmptyCurrentBatch().
// The process is intended (as of 2020-01-22) to stay in this "loop" of restarts as long
// as the scraped site does not provide any data.
// At an early stage admin was emailed when this occured, but this might not be a good
// idea if the scraped site's state remains empty for a long time.
const handleEmptyPreviousBatch = (prev, curr) => {
  log.handleEmptyPreviousBatch(prev, curr)
}

// If zero new apartments were scraped, something might be wrong (the scraped site might
// not be responding for instance). Hence, one more run of updateApartments() is run just
// in case.
// BEWARE: it is important that curr is returned, so that the current process is killed,
// rather than starting multiple processes in parallel.
const handleEmptyCurrentBatch = (prev, curr) => {
  log.handleEmptyCurrentBatch(prev, curr)
  updateApartments()
  return curr
}

// Looks for clones between prev and curr. If some object is not the same in the two, it
// implicated that a short term apartment has been released (ordinary apartments are still
// up, but new ones have been added without a proper flush). If this is the case, prepare
// the emailing to subscribers. Else presume that a proper flush has been made.
const handleNewRelease = (prev, curr) => {
  let shortTermAmount = amountOfShortTerms(prev, curr)
  log.handleNewRelease(prev, curr, shortTermAmount)
  if (shortTermAmount > 0) {
    handleNewShortTerms(shortTermAmount, curr)
  } else {
    handleNewFlush(curr)
  }
}

const handleNewShortTerms = (shortTermAmount, curr) => {
  const shortTerms = getTheShortTerms(shortTermAmount, curr)
  log.handleShortTerms(shortTerms)
  mailUtils.sendEmail('shortTerm', shortTerms)
}

const handleNewFlush = curr => {
  log.handleNewFlush()
  interestCheck(curr)
}

// Concatenate the list of previous apartments with the new. Check if any
// object's id matches. In that case some short term apartment(s) has been released.
const amountOfShortTerms = (prev, curr) => {
  let amountOfShortTerms = 0
  occurances = {}
  prevAndCurr = prev.concat(curr)
  prevAndCurr.map(obj => {
    occurances[obj.id] = occurances[obj.id] ? occurances[obj.id] + 1 : 1
  })
  for (let attr in occurances) {
    if (occurances[attr] !== 1) {
      amountOfShortTerms++
    }
  }
  return amountOfShortTerms
}

const interestCheck = arr => {
  const apartmentsOfInterest = checkApartmentsOfInterest(arr)
  const isOfInterest = apartmentsOfInterest.length > 0
  if (isOfInterest) {
    console.log('Nya Nypon har kommit - mailar')
    mailUtils.sendEmail('specific', apartmentsOfInterest)
  }
}

const checkApartmentsOfInterest = arr => {
  let apartments = []
  arr.forEach(ap => {
    if (ap.adress.startsWith('Körsbärsvägen 9')) {
      apartments.push(ap)
    }
  })
  return apartments
}

// Return an array of the short term apartments. This method assumes that the latest
// release will be placed at the top of the page (which it has all of 2019)
const getTheShortTerms = (amountOfShortTerms, curr) => {
  let shortTerms = []
  for (let i = 0; i < amountOfShortTerms; i++) {
    shortTerms.push(curr[i])
  }
  return shortTerms
}

module.exports = {
  checkIfNewRelease: checkIfNewRelease,
  amountOfShortTerms,
  handlePotentialNewRelease
}
