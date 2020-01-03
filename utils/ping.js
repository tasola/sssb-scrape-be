// Keep Heroku awake
const http = require('http')

const pingHeroku = () => {
  setInterval(() => {
    http.get('http://sssb-scrape.herokuapp.com')
  }, 300000)
}

module.exports = {
  pingHeroku: pingHeroku
}
