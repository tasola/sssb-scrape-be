const mailUtils = require('../../utils/mail')
const { adminEmails } = require('../../admin-emails')

const notifyAdmin = usersSubscriptions => {
  adminEmails.forEach(email => {
    mailUtils.generateAdminNotification(usersSubscriptions, email)
  })
}

module.exports = {
  notifyAdmin
}
