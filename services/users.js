var axios = require('axios')

const { removeLeadingZeroFromString } = require('../utils/utils')
const shortTermMailer = require('../services/mail/short-term')
const generalMailer = require('../services/mail/general')
const isNotProduction = process.env.NODE_ENV !== 'production'

// let userMatcherBaseUrl = process.env.USER_MATCHER_BASE_URL
let userMatcherBaseUrl

if (isNotProduction) {
  userMatcherBaseUrl = 'http://localhost:8080'
}

const handleShortTermRelease = async shortTerms => {
  const usersSubscriptions = arrangeUsersSubscriptions(shortTerms)
  factory.emailSubscribersShortTermRelease(usersSubscriptions)
  return usersSubscriptions
}

const handleGeneralRelease = apartments => {
  const usersSubscriptions = arrangeUsersSubscriptions(apartments)
  emailSubscribersGeneralRelease(usersSubscriptions)
  return usersSubscriptions
}

// Iterate over the list of new short term releases and arrange an object of
// all subscribers with their respective short term releases of interest
const arrangeUsersSubscriptions = async shortTerms => {
  let usersSubscriptions = {}
  for (let i = 0; i < shortTerms.length; i++) {
    const apartment = shortTerms[i]
    const { area, floor } = apartment
    const subscriberEmails = await getSubscribersFor(
      area,
      removeLeadingZeroFromString(floor)
    )
    usersSubscriptions = updateUsersSubscriptions(
      usersSubscriptions,
      subscriberEmails,
      apartment
    )
  }
  return usersSubscriptions
}

// Fetch all subscribers for the given area and floor from the user matcher API
const getSubscribersFor = async (area, floor) => {
  const endpoint = `${userMatcherBaseUrl}/users/${area}/${floor}`
  const subscriberEmails = await axios.get(endpoint)
  return subscriberEmails.data
}

// Iterate over the list of emails and add an array of all apartments of interest.
// In the end, the usersSubsctiptions object should look like:
//
// usersSubscriptions = {
//  userEmail1: [areaObject1, areaObject2],
//  userEmail2: [areaObject1]
// }
const updateUsersSubscriptions = (
  usersSubscriptions,
  subscriberEmails,
  apartment
) => {
  subscriberEmails.forEach(email => {
    if (usersSubscriptions[email] === undefined) {
      usersSubscriptions[email] = [apartment]
    } else {
      usersSubscriptions[email].push(apartment)
    }
  })
  return usersSubscriptions
}

const emailSubscribersShortTermRelease = usersSubscriptions =>
  shortTermMailer.emailSubscribers(usersSubscriptions)

const emailSubscribersGeneralRelease = usersSubscriptions =>
  generalMailer.emailSubscribers(usersSubscriptions)

// After compilation the functions are exported with different signatures, with
// full name and while stubbing we stub the global function but while calling it
// from within the other function, we call the local function. Hence, it is required
// that all internal and external function calls go through this factory.
const factory = {
  emailSubscribersShortTermRelease
}

module.exports = {
  handleShortTermRelease,
  handleGeneralRelease,
  arrangeUsersSubscriptions,
  updateUsersSubscriptions,
  getSubscribersFor,
  factory
}
