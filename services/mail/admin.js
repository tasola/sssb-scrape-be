const mailUtils = require('../../utils/mail')

const adminEmails = process.env.ADMIN_EMAILS.split(',')

const notifyAdmin = usersSubscriptions => {
  adminEmails.forEach(email => {
    mailUtils.generateAdminNotification(usersSubscriptions, email)
  })
}

module.exports = {
  notifyAdmin
}
