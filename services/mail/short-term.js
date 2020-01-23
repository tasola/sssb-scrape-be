const mailUtils = require('../../utils/mail')

const emailSubscribers = usersSubscriptions => {
  Object.keys(usersSubscriptions).forEach(userEmail => {
    const userSpecificSubscriptions = usersSubscriptions[userEmail]
    const generatedUserMail = mailUtils.generateShortTermContent(
      userSpecificSubscriptions,
      userEmail,
      true
    )
    mailUtils.send(generatedUserMail)
  })
}

module.exports = { emailSubscribers }
