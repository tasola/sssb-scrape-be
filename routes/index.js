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
let areasOfInterest = ["Körsbärsvägen 9"]
let apartmentNosOfInterest = ["03", "02"]

const scrapeApartments = async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();

  await page.goto(url, {waitUntil: 'networkidle2'});
  await page.waitFor(1000);

  const result = await page.evaluate(() => {
    let data = [];
      const primaryData = document.querySelectorAll('.ObjektAdress');
      const metaData = document.querySelectorAll(".ObjektDetaljer > dl > dd")
      for (let i = 0; i < primaryData.length; i++){
        data.push({
          adress: primaryData[i].childNodes[0].text,
          id: metaData[0 + i * 7].innerHTML,
          area: metaData[1 + i * 7].innerHTML,
          floor: metaData[2 + i * 7].innerHTML,
          sqareMeters: metaData[3 + i * 7].innerHTML,
          rent: metaData[4 + i * 7].innerHTML,
          moveIn: metaData[5 + i * 7].innerHTML,
          queue: metaData[6 + i * 7].innerHTML,
        })
      }
      return data
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

const interestCheck = (arr) => {
  const apartmentsOfInterest = checkApartmentsOfInterest(arr);
  const isOfInterest = apartmentsOfInterest.length > 0;
  if (isOfInterest) {
    console.log("Nyponet!")
    console.log(apartmentsOfInterest)
    mailUtils.sendEmail("nypon", apartmentsOfInterest);
  }
}

const checkIfNewRelease = (prev, curr) => {
  if (!arraysAreEqual(prev, curr)){
    interestCheck(curr);
    if (prev.length === 0){
      // Email author about server restart
      console.log("The server seems to have restarted")
      mailUtils.sendEmail("admin");
    } else if (curr.length === 0) {
      // If the results show 0 apartments, retry one time.
      updateApartments();
      return;
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
    if (ap.adress.startsWith("Körsbärsvägen 9")){
      apartmentNumbers.push(ap.adress.slice(-4))
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

// Middleware for async route
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
