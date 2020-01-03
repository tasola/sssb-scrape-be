const express = require('express')
const router = express.Router()
require('dotenv').config()

const url =
  'https://www.sssb.se/soka-bostad/sok-ledigt/lediga-bostader/?paginationantal=100'
const puppeteer = require('puppeteer')
const mailUtils = require('./../utils/mail.js')

// Keep Heroku awake
const http = require('http')
setInterval(() => {
  http.get('http://sssb-scrape.herokuapp.com')
}, 300000)

let savedApartments = []
let areasOfInterest = ['Körsbärsvägen 9']
let apartmentNosOfInterest = ['03', '02']
const refreshTimer =
  process.env.NODE_ENV !== 'production' ? 1000 * 30 : 1000 * 60 * 5

const scrapeApartments = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()

  await page.goto(url, { waitUntil: 'networkidle2' })
  await page.waitFor(10000)

  const result = await page.evaluate(() => {
    let data = []
    const primaryData = document.querySelectorAll('.ObjektAdress')
    const objectLink = document.querySelectorAll('.ObjektAdress > a')
    const metaData = document.querySelectorAll('.ObjektDetaljer > dl > dd')
    const areaData = document.querySelectorAll('.ObjektDetaljer > dl > dd > a')
    for (let i = 0; i < primaryData.length; i++) {
      data.push({
        adress: primaryData[i].childNodes[0].text,
        id: metaData[0 + i * 6].innerHTML,
        area: areaData[i].innerHTML,
        floor: metaData[0 + i * 6].innerHTML.substring(7, 9),
        sqareMeters: metaData[2 + i * 6].innerHTML,
        rent: metaData[3 + i * 6].innerHTML.replace(/&nbsp;/gi, ''),
        moveIn: metaData[4 + i * 6].innerHTML,
        queue: metaData[5 + i * 6].innerHTML,
        link: objectLink[i].href
      })
    }
    return data
  })
  //console.log(result)
  browser.close()
  return result
}

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
      console.log('----')
      console.log(x[propertyName])
      console.log('is not equal to')
      console.log(y[propertyName])
      console.log('----')
      return false
    }
  }
  return true
}

// Concatenate the list of previous apartments with the new. Check if any
// object's id matches. In that case some short term apartment has been released.
let amountOfShortTerms = (prev, curr) => {
  amountOfShortTerms = 0
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

const interestCheck = arr => {
  const apartmentsOfInterest = checkApartmentsOfInterest(arr)
  const isOfInterest = apartmentsOfInterest.length > 0
  if (isOfInterest) {
    console.log('MAILAR OM NYTT NYPON!')
    //console.log(apartmentsOfInterest)
    mailUtils.sendEmail('specific', apartmentsOfInterest)
  }
}

const checkIfNewRelease = (prev, curr) => {
  console.log(arraysOfObjectsAreSame(prev, curr))
  if (!arraysOfObjectsAreSame(prev, curr)) {
    if (prev.length === 0) {
      // Email author about server restart
      console.log('The server seems to have restarted')
      //mailUtils.sendEmail("admin");
    }
    if (curr.length === 0) {
      // If the results show 0 apartments, retry one time.
      console.log("Something's off? Trying to update")
      updateApartments()
      return
    } else {
      interestCheck(curr)
      let shortTermAmount = amountOfShortTerms(prev, curr)
      if (shortTermAmount > 0) {
        mailUtils.sendEmail('shortTerm', getTheShortTerms(shortTermAmount))
      } else {
        console.log('New release!')
        // mailUtils.sendEmail('subscriber')
      }
    }
    savedApartments = curr
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

const updateApartments = () => {
  const result = scrapeApartments().then(apartments => {
    checkIfNewRelease(savedApartments, apartments)
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

timedUpdate()

// Middleware for async route
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

/* GET home page. */
router.get(
  '/',
  asyncMiddleware(async (req, res, next) => {
    const ap = await updateApartments()
    res.send(ap)
  })
)

module.exports = router
