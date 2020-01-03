const express = require('express')
const router = express.Router()
const { updateApartments, timedUpdate } = require('../services/refresh')
const { asyncMiddleware } = require('../utils/middleware')
const { pingHeroku } = require('../utils/ping')

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
