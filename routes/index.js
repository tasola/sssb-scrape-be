const express = require('express');
const router = express.Router();

const url = 'https://www.sssb.se/soka-bostad/sok-ledigt/lediga-bostader/?paginationantal=50';
const puppeteer = require('puppeteer');
const mailUtils = require("./../utils/mail.js");

// Keep Heroku awake
const http = require("http");
setInterval(() => {
    http.get("http://sssb-scrape.herokuapp.com");
}, 300000);

let savedApartments = [];

const logger = (req, res, next) => {
  console.log("HEJ")
  next();
}

router.use(logger);

const scrapeApartments = async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();

  await page.goto(url);
  await page.waitFor(1000);

  const result = await page.evaluate(() => {
    let data = [];
      const text = document.querySelectorAll('.ObjektAdress');
      for (let i = 0; i < text.length; i++){
        data.push(text[i].childNodes[0].text)
      }
      return data;
  })
  browser.close();
  return result;
}

const arraysAreEqual = (prev, curr) => {
  return prev.length === curr.length
  && prev.sort().every((value, index) => {
    return value === curr.sort()[index]
  });
}

const checkIfNewRelease = (prev, curr) => {
  if (!arraysAreEqual(prev, curr)){
    const apartmentsOfInterest = checkApartmentsOfInterest(curr);
    const isOfInterest = apartmentsOfInterest.length > 0;
    if (isOfInterest) {
      console.log("Nyponet!")
      console.log(apartmentsOfInterest)
      mailUtils.sendEmail("nypon", apartmentsOfInterest);
    }
    if (prev.length === 0){
      // Email author about server restart
      console.log("The server seems to have restarted")
      mailUtils.sendEmail("admin");
    } else {
      // Email users about general update
      console.log("NEW RELEASE!")
      mailUtils.sendEmail("subscriber")
    }
    console.log("New release!")
    savedApartments = curr;
  }
}

const checkApartmentsOfInterest = (arr) => {
  let apartmentNumbers = [];
  arr.forEach((ap) => {
    if (ap.startsWith("Körsbärsvägen 9")){
      apartmentNumbers.push(ap.slice(-4))
    }
  })
  return apartmentNumbers;
}

const updateApartments = () => {
  const result = scrapeApartments().then((apartments) => {
    console.log("kört scrapeApartments och får: ")
    console.log(apartments)
    checkIfNewRelease(savedApartments, apartments);
    return apartments;
  });
  return result;
}

const timedUpdate = () => {
  updateApartments().then(() => {
    console.log("Process finished, waiting for refresh");
    setTimeout(() => {
      console.log("Refreshing...")
      timedUpdate();
    }, 1000 * 60 * 5);
  }).catch(err => console.error("Error in timedUpdate", err))
}

timedUpdate();

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

/* GET home page. */
router.get('/', asyncMiddleware(async (req, res, next) => {
  const ap = await updateApartments()
  res.send(ap);
}));

module.exports = router;
