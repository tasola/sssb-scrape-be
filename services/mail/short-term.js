const mailUtils = require('../../utils/mail/mail')
const admin = require('./admin')

const emailSubscribers = (usersSubscriptions) => {
  notifyAdmin(usersSubscriptions)
  Object.keys(usersSubscriptions).forEach((userEmail) => {
    const userSpecificSubscriptions = usersSubscriptions[userEmail]
    const generatedUserMail = mailUtils.generateShortTermContent(
      userSpecificSubscriptions,
      userEmail
    )
    mailUtils.send(generatedUserMail)
  })
}

const notifyAdmin = (usersSubscriptions) => {
  admin.notifyAdmin(usersSubscriptions)
}

module.exports = { emailSubscribers }
