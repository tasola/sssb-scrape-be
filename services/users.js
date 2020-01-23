var axios = require('axios')

const { removeLeadingZeroFromString } = require('../utils/utils')
const shortTermMailer = require('../services/mail/short-term')
const isNotProduction = process.env.NODE_ENV !== 'production'

// let userMatcherBaseUrl = process.env.USER_MATCHER_BASE_URL
let userMatcherBaseUrl

if (isNotProduction) {
  userMatcherBaseUrl = 'http://localhost:8080'
}

const handleNewShortTerms = async shortTerms => {
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
  emailSubscribers(usersSubscriptions)
}

const getSubscribersFor = async (area, floor) => {
  const endpoint = `${userMatcherBaseUrl}/users/${area}/${floor}`
  const subscriberEmails = await axios.get(endpoint)
  return subscriberEmails.data
}

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

const emailSubscribers = usersSubscriptions => {
  shortTermMailer.emailSubscribers(usersSubscriptions)
}

module.exports = {
  handleNewShortTerms
}
