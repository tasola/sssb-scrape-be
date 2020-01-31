const { arraysOfObjectsAreSame } = require('../utils/utils')
const { updateApartments } = require('../services/refresh')
const users = require('./users')
const log = require('../utils/log')

const checkIfNewRelease = (prev, curr) => {
  const areArraysIdentical = arraysOfObjectsAreSame(prev, curr)
  log.isThisANewRelease(areArraysIdentical, prev, curr)
  if (!areArraysIdentical) {
    return handlePotentialNewRelease(prev, curr)
  }
  return curr
}

// TODO: If a subset of prev ended this function handles the drop from (for example)
// 91 to 89 apartments (where all 89 were in prev) as a new release. Add logic that
// handles this.
const handlePotentialNewRelease = (prev, curr) => {
  if (prev.length === 0) {
    handleEmptyPreviousBatch(prev, curr)
  }
  if (curr.length === 0) {
    return handleEmptyCurrentBatch(prev, curr)
  } else {
    handleBatchChange(prev, curr)
  }
  return curr
}

// Odd cases: (New release, with one object being a re-release), (expiration and short term
// release simultaneously)
const handleBatchChange = (prev, curr) => {
  const idHitsDict = countIdHits(prev, curr)
  let hasOnlySoloHits = true
  let amountOfNewApartments = 0

  for (let apartment in idHitsDict) {
    if (idHitsDict[apartment]['hits'] === 1) {
      if (idHitsDict[apartment]['indexes'][0] >= prev.length) {
        amountOfNewApartments++
      }
    } else {
      hasOnlySoloHits = false
    }
  }
  console.log('----------')
  console.log(amountOfNewApartments)
  console.log(hasOnlySoloHits)
  console.log(curr[2].area)
  console.log('----------')

  if (!hasOnlySoloHits && amountOfNewApartments < 4) {
    let shortTermAmount = factory.amountOfShortTerms(idHitsDict)
    log.handleNewRelease(prev, curr, shortTermAmount)
    factory.handleNewShortTerms(shortTermAmount, curr)
    return
  }

  factory.handleNewFlush(curr)
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
  let shortTermAmount = factory.amountOfShortTerms(prev, curr)
  log.handleNewRelease(prev, curr, shortTermAmount)
  if (shortTermAmount > 0) {
    factory.handleNewShortTerms(shortTermAmount, curr)
  } else {
    factory.handleNewFlush(curr)
  }
}

const handleNewShortTerms = (shortTermAmount, curr) => {
  const shortTerms = getTheShortTerms(shortTermAmount, curr)
  log.handleShortTerms(shortTerms)
  users.handleShortTermRelease(shortTerms)
}

const handleNewFlush = curr => {
  log.handleNewFlush()
  users.handleGeneralRelease(curr)
}

// Concatenate the list of previous apartments with the new. Check if any
// object's id matches. In the case that some id's don't match -
// some short term apartment(s) has been released.
const amountOfShortTerms = idHitsDict => {
  let amountOfShortTerms = 0
  for (let attr in idHitsDict) {
    if (idHitsDict[attr]['hits'] === 1) {
      amountOfShortTerms++
    }
  }
  return amountOfShortTerms
}

// TODO: Write tests. Test that an obj with 1 hit also only have length 1 on indexes
const countIdHits = (prev, curr) => {
  prevAndCurr = prev.concat(curr)
  occurances = {}
  prevAndCurr.forEach((obj, index) => {
    if (occurances[obj.id] && occurances[obj.id]['hits']) {
      occurances[obj.id]['hits'] += 1
      occurances[obj.id]['indexes'].push(index)
    } else {
      occurances[obj.id] = {
        hits: 1,
        indexes: [index]
      }
    }
  })
  return occurances
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

// After compilation the functions are exported with different signatures, with
// full name and while stubbing we stub the global function but while calling it
// from within the other function, we call the local function. Hence, it is required
// that all internal and external function calls go through this factory.
const factory = {
  handleNewRelease,
  amountOfShortTerms,
  handleNewShortTerms,
  handleNewFlush
}

module.exports = {
  checkIfNewRelease: checkIfNewRelease,
  amountOfShortTerms,
  handlePotentialNewRelease,
  countIdHits,
  handleBatchChange,
  factory
}
