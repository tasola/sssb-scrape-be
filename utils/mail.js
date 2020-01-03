const nodemailer = require('nodemailer')
require('dotenv').config()

mailConfig = {
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID
  }
}

let transporter = nodemailer.createTransport(mailConfig)

let adminOptions = {
  from: 'SSSB Info <sssb-scrape@hotmail.com>',
  to: 'petter.tk@hotmail.com',
  subject: 'Server Information',
  text:
    'Lägenhetslistan är tom. Förmodligen är servern nystartad, annars kan det vara värt att kolla upp.'
}

let subscriberOptions = {
  from: 'SSSB Info <sssb-scrape@hotmail.com>',
  to: 'petter.tk@hotmail.com',
  subject: 'SSSB subscription',
  text: 'Det har släppts nya läggor din sjuke fan'
}

const specificOptionsTemplate = {
  from: 'SSSB Info <sssb-scrape@hotmail.com>',
  to: 'petter.tk@hotmail.com',
  subject: '',
  text: '',
  html: ''
}

const shortTermOptionsTemplate = {
  from: 'SSSB Info <sssb-scrape@hotmail.com>',
  to: 'petter.tk@hotmail.com',
  subject: '',
  text: '',
  html: ''
}

// 'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
// 'https://localhost:3000/organisation/reset-request/submit?token=' +
// "Asfasfasfa1231241421asfasfsa" +
// '\n\n'

const send = type => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('In prod this mail would have been sent with data:\n ')
    console.log(type)
  } else {
    transporter.sendMail(type, (error, info) => {
      if (error) return console.log(error)
      else console.log('The message was sent')
      console.log(info + '\n')
    })
  }
}

const generateSpecificContent = apartments => {
  let specificOptions = Object.assign({}, specificOptionsTemplate)
  if (apartments) {
    const grammar = apartments.length > 1 ? 's' : ''
    specificOptions.subject = 'New ' + apartments[0].area + ' release!'
    specificOptions.html =
      'SSSB just released ' +
      apartments.length +
      ' new ' +
      apartments[0].area +
      '-apartment' +
      grammar +
      '!' +
      '\n These are the ' +
      ' apartment' +
      grammar +
      ': \n' +
      '<hr>'
    apartments.forEach(ap => {
      specificOptions.html += '<p>Area: ' + ap.area + '</p>'
      specificOptions.html += '<p>Floor: ' + ap.floor + '</p>'
      specificOptions.html +=
        '<p>Apartment number: ' + ap.adress.slice(-4) + '</p>'
      specificOptions.html +=
        "<p>Book it <a href='" + ap.link + "'> here <a/></p>"
      specificOptions.html += '<hr>'
    })
  }
  return specificOptions
}

const generateShortTermContent = apartments => {
  let shortTermOptions = Object.assign({}, shortTermOptionsTemplate)
  if (apartments) {
    const grammar = apartments.length > 1 ? 's' : ''
    shortTermOptions.subject = 'New short-term release for '
    shortTermOptions.html =
      'SSSB just released ' +
      apartments.length +
      ' new ' +
      apartments[0].area +
      '-apartment' +
      grammar +
      '!' +
      '\n These are the ' +
      ' apartment' +
      grammar +
      ': \n' +
      '<hr>'
    apartments.forEach(ap => {
      shortTermOptions.subject += '<p>' + ap.area + ' ' + '</p>'
      shortTermOptions.html += '<p>Area: ' + ap.area + '</p>'
      shortTermOptions.html += '<p>Floor: ' + ap.floor + '</p>'
      shortTermOptions.html +=
        '<p>Apartment number: ' + ap.adress.slice(-4) + '</p>'
      shortTermOptions.html +=
        "<p>Book it <a href='" + ap.link + "'> here <a/></p>"
      shortTermOptions.html += '<hr>'
    })
  }
  return shortTermOptions
}

const decideEmail = (role, apartments) => {
  switch (role) {
    case 'admin':
      send(adminOptions)
      break
    case 'subscriber':
      send(subscriberOptions)
      break
    case 'specific':
      const specificContent = generateSpecificContent(apartments)
      send(specificContent)
      break
    case 'shortTerm':
      const shortTermContent = generateShortTermContent(apartments)
      send(shortTermContent)
      break
    default:
      send(adminOptions)
  }
}

module.exports = {
  sendEmail: (role, apartments) => {
    decideEmail(role, apartments)
  }
}
