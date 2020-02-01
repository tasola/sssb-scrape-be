const { arraysOfObjectsAreSame } = require('../utils/utils')
const { updateApartments } = require('../services/refresh')
const users = require('./users')
const log = require('../utils/log')

// The first time updateApartments is called (which in turns calls this function),
// prev is always empty. Jump out of the loop immediately when this happens.
const checkIfNewRelease = (prev, curr, doEmail) => {
  if (!doEmail) {
    log.serverRestart()
    return curr
  }
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
    handleBatchChange(prev, curr)
  }
  return curr
}

// Analyze previous and curr. If an id only occurs once in the arrays, it potentially is
// a new release. However, if that one hit was found in the prev array it indicates that
// that apartment simply was removed - hence no announcement is needed. If the hit is in
// curr however, there is a new apartment. At this stage it is impossible to differ a
// short-term release to an ordinary release with some re-releases. Right now (2020-02-01)
// it is presumed that if the matching subsets are longer than 3, it is a re-release, else
//it is a short-term. This should however be updated later, as it is not bullet proof.
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

  if (
    !hasOnlySoloHits &&
    amountOfNewApartments < 4 &&
    amountOfNewApartments > 0
  ) {
    let shortTermAmount = factory.amountOfShortTerms(idHitsDict)
    log.handleNewRelease(prev, curr, shortTermAmount)
    factory.handleNewShortTerms(shortTermAmount, curr)
    return
  }

  if (amountOfNewApartments > 0) factory.handleNewFlush(curr)
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
