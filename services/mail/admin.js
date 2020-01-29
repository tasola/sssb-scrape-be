const mailUtils = require('../../utils/mail')
const log = require('../../utils/log')

// The dotenv list is a string followed by a comma
const adminEmails = process.env.ADMIN_EMAILS.split(',')

const notifyAdmin = usersSubscriptions => {
  log.emailAdmins()
  adminEmails.forEach(email => {
    if (email !== '') {
      const content = mailUtils.generateAdminNotification(
        usersSubscriptions,
        email
      )
      mailUtils.send(content)
    }
  })
}

module.exports = {
  notifyAdmin
}
