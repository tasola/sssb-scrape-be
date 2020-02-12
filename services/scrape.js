const puppeteer = require('puppeteer')

const url =
  'https://www.sssb.se/soka-bostad/sok-ledigt/lediga-bostader/?paginationantal=100'

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
    const type = document.querySelectorAll('.ObjektTyp > a')
    const metaData = document.querySelectorAll('.ObjektDetaljer > dl > dd')
    const areaData = document.querySelectorAll('.ObjektDetaljer > dl > dd > a')
    for (let i = 0; i < primaryData.length; i++) {
      data.push({
        adress: primaryData[i].childNodes[0].text,
        id: metaData[0 + i * 6].innerHTML,
        area: areaData[i].innerHTML,
        squareMeters: metaData[2 + i * 6].innerHTML,
        rent: metaData[3 + i * 6].innerHTML.replace(/&nbsp;/gi, ''),
        moveIn: metaData[4 + i * 6].innerHTML,
        queue: metaData[5 + i * 6].innerHTML,
        type: type[i].innerHTML,
        link: objectLink[i].href
      })
    }
    return data
  })
  browser.close()
  return result
}

module.exports = {
  scrapeApartments: scrapeApartments
}
