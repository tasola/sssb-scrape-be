const sender = 'SSSB Info <sssb-scrape@hotmail.com>'
const recipient = 'petter.kullander@gmail.com'

let admin = {
  from: sender,
  to: recipient,
  subject: 'Server Information',
  text:
    'Lägenhetslistan är tom. Förmodligen är servern nystartad, annars kan det vara värt att kolla upp.'
}

let subscriber = {
  from: sender,
  to: recipient,
  subject: 'SSSB subscription',
  text: 'Det har släppts nya läggor din sjuke fan'
}

let template = {
  from: sender,
  to: recipient,
  subject: '',
  text: '',
  html: ''
}

module.exports = {
  admin: admin,
  subscriber: subscriber,
  template: template
}
