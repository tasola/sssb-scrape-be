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
  await page.waitFor(10000);

  const result = await page.evaluate(() => {
    let data = [];
      const primaryData = document.querySelectorAll('.ObjektAdress');
      const metaData = document.querySelectorAll(".ObjektDetaljer > dl > dd")
      const areaData = document.querySelectorAll(".ObjektDetaljer > dl > dd > a")
      for (let i = 0; i < primaryData.length; i++){
         data.push({
           adress: primaryData[i].childNodes[0].text,
           id: metaData[0 + i * 6].innerHTML,
           area: areaData[i].innerHTML,
           floor: metaData[0 + i * 6].innerHTML.substring(7,9),
           sqareMeters: metaData[2 + i * 6].innerHTML,
           rent: metaData[3 + i * 6].innerHTML.replace(/&nbsp;/gi, ''),
           moveIn: metaData[4 + i * 6].innerHTML,
           queue: metaData[5 + i * 6].innerHTML,
         })
      }
      return data
  })
  //console.log(result)
  browser.close();
  return result;
}

const arraysOfObjectsAreSame = (prev, curr) => {
  if (prev.length !== curr.length) return false;
  for (let i = 0; i < prev.length; i++){
    if (!objectsAreSame(prev[i], curr[i])){
      return false;
    }
  }
  return true;
}

const objectsAreSame = (x, y) => {
  var objectsAreSame = true;
  for(var propertyName in x) {
     if(x[propertyName] !== y[propertyName]) {
        objectsAreSame = false;
        break;
     }
  }
  return objectsAreSame;
}

const interestCheck = (arr) => {
  const apartmentsOfInterest = checkApartmentsOfInterest(arr);
  const isOfInterest = apartmentsOfInterest.length > 0;
  if (isOfInterest) {
    console.log("MAILAR OM NYTT NYPON!")
    //console.log(apartmentsOfInterest)
    mailUtils.sendEmail("nypon", apartmentsOfInterest);
  }
}

const checkIfNewRelease = (prev, curr) => {
  console.log(prev[0])
  console.log(curr[0])
  console.log(arraysOfObjectsAreSame(prev, curr))
  if (!arraysOfObjectsAreSame(prev, curr)){
    if (prev.length === 0){
      // Email author about server restart
      console.log("The server seems to have restarted")
      //mailUtils.sendEmail("admin");
    }
    if (curr.length === 0) {
      // If the results show 0 apartments, retry one time.
      console.log("Something's off? Trying to update")
      updateApartments();
      return;
    } else {
      interestCheck(curr);
      // Email users about general update
      //console.log("NEW RELEASE!")
      mailUtils.sendEmail("subscriber")
    }
    //console.log("New release!")
    //console.log(curr)
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
    // console.log("kört scrapeApartments och får: ")
    // console.log(apartments)
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
  //}, 1000 * 30);
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
