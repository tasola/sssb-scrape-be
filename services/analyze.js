const { arraysOfObjectsAreSame } = require('../utils/utils')
const log = require('../utils/log')

// TODO: Extract this?
const mailUtils = require('../utils/mail.js')

const checkIfNewRelease = (prev, curr) => {
  const areArraysIdentical = arraysOfObjectsAreSame(prev, curr)
  log.isThisANewRelease(areArraysIdentical, prev, curr)
  if (!areArraysIdentical) {
    if (prev.length === 0) {
      // Email author about server restart
      console.log('The server seems to have restarted')
      //mailUtils.sendEmail("admin");
    }
    if (curr.length === 0) {
      // If the results show 0 apartments, retry one time.
      console.log("Something's off? Trying to update")
      updateApartments()
      return curr
    } else {
      let shortTermAmount = amountOfShortTerms(prev, curr)
      if (shortTermAmount > 0) {
        mailUtils.sendEmail('shortTerm', getTheShortTerms(shortTermAmount))
      } else {
        interestCheck(curr)
        console.log('New release!')
      }
    }
  }
  return curr
}

// Concatenate the list of previous apartments with the new. Check if any
// object's id matches. In that case some short term apartment has been released.
const amountOfShortTerms = (prev, curr) => {
  let amountOfShortTerms = 0
  occurances = {}
  prevAndCurr = prev.concat(curr)
  prevAndCurr.map(obj => {
    occurances[obj.id] = occurances[obj.id] ? occurances[obj.id] + 1 : 1
  })
  for (let attr in occurances) {
    if (occurances[attr] !== 1) {
      shortTermsAmount++
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
const getTheShortTerms = amountOfShortTerms => {
  console.log('New short term-apartments!')
  let shortTerms = []
  for (let i = 0; i < amountOfShortTerms; i++) {
    shortTerms.push(curr[i])
  }
  return shortTerms
}

module.exports = {
  checkIfNewRelease: checkIfNewRelease
}
