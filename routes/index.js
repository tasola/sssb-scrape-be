const express = require('express');
const router = express.Router();

const url = 'https://www.sssb.se/soka-bostad/sok-ledigt/lediga-bostader/?paginationantal=50';
const puppeteer = require('puppeteer');
const mailUtils = require("./../utils/mail.js");

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
    if (isNyponet(curr)) {
      console.log("Nyponet!")
      mailUtils.sendEmail("nypon");
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

const isNyponet = (arr) => {
  console.log(arr[1])
  console.log(arr[1].startsWith("Körsbärsvägen 9"))
  let containsNyponet = false;
  arr.forEach((ap) => {
    if (ap.startsWith("Körsbärsvägen 9")) containsNyponet = true;
  })
  return containsNyponet;
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
