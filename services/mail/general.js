const mailUtils = require('../../utils/mail/mail')
const log = require('../../utils/log/log')
const admin = require('./admin')

const emailSubscribers = (usersSubscriptions) => {
  log.emailSubscribers()
  notifyAdmin(usersSubscriptions)
  Object.keys(usersSubscriptions).forEach((userEmail) => {
    const userSpecificSubscriptions = usersSubscriptions[userEmail]
    const generatedUserMail = mailUtils.generateGeneralContent(
      userSpecificSubscriptions,
      userEmail
    )
    mailUtils.send(generatedUserMail)
  })
}

const notifyAdmin = (usersSubscriptions) =>
  admin.notifyAdmin(usersSubscriptions)

module.exports = { emailSubscribers }
