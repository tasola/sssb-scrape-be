const express = require('express')
const router = express.Router()
const { updateApartments, timedUpdate } = require('../services/refresh')
const { asyncMiddleware } = require('../utils/server-config/middleware')
const { pingHeroku } = require('../utils/server-config/ping')

timedUpdate()
pingHeroku()

router.get(
  '/',
  asyncMiddleware(async (req, res, next) => {
    const ap = await updateApartments()
    res.send(ap)
  })
)

module.exports = router
