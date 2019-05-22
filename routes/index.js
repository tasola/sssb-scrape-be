const express = require('express');
const router = express.Router();

const url = 'https://www.sssb.se/soka-bostad/sok-ledigt/lediga-bostader/?paginationantal=50';
const puppeteer = require('puppeteer');

let test = [];


const logger = (req, res, next) => {
  console.log("HEJ")
  next();
}

router.use(logger);

// const b = async () => {
//   puppeteer.launch().then(async browser => {
//     const page = await browser.newPage();
//     await page.goto(url);
//     //await page.waitFor(1000);
//     const apartments = await page.evaluate(() => {
//       let data = [];
//       const text = document.querySelectorAll('.ObjektAdress');
//       for (let i = 0; i < text.length; i++){
//         data.push(text[i].childNodes[0].text)
//       }
//       return data;
//     })
//     console.info(apartments)
//   })
// }

const scrapeApartments = async () => {
  const browser = await puppeteer.launch();
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

const updateApartments = () => {
  const scraped = scrapeApartments().then((value) => {
    console.log("kört scrapeApartments och får: ")
    console.log(value)
    test = value;
    return value;
  });
  return scraped;
}

const timedUpdate = () => {
  updateApartments().then(() => {
    console.log("Process finished, waiting for refresh");
    setTimeout(() => {
      console.log("Refreshing...")
      timedUpdate();
    }, 1000 * 5);
  }).catch(err => console.error("Error in timedUpdate", err))
}

timedUpdate();

//updateApartments();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.send(test);
});

module.exports = router;
