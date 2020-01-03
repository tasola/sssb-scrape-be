let admin = {
  from: 'SSSB Info <sssb-scrape@hotmail.com>',
  to: 'petter.tk@hotmail.com',
  subject: 'Server Information',
  text:
    'Lägenhetslistan är tom. Förmodligen är servern nystartad, annars kan det vara värt att kolla upp.'
}

let subscriber = {
  from: 'SSSB Info <sssb-scrape@hotmail.com>',
  to: 'petter.tk@hotmail.com',
  subject: 'SSSB subscription',
  text: 'Det har släppts nya läggor din sjuke fan'
}

let template = {
  from: 'SSSB Info <sssb-scrape@hotmail.com>',
  to: 'petter.tk@hotmail.com',
  subject: '',
  text: '',
  html: ''
}

module.exports = {
  admin: admin,
  subscriber: subscriber,
  template: template
}
