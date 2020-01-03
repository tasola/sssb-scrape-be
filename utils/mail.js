const nodemailer = require('nodemailer')
const options = require('./options')
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

const send = type => {
  if (process.env.NODE_ENV !== 'production') {
    sendDev(type)
  } else {
    sendProd(type)
  }
}

const sendDev = type => {
  console.log('In prod this mail would have been sent with data:\n ')
  console.log(type)
}

const sendProd = type => {
  transporter.sendMail(type, (error, info) => {
    if (error) return console.log(error)
    else console.log('The message was sent')
    console.log(info)
    console.log('\n')
  })
}

const generateContent = (apartments, isShortTerm) => {
  let template = options.template
  let content = Object.assign({}, template)
  const shortTerm = isShortTerm ? 'SHORT TERM' : ''
  if (apartments) {
    const grammar = apartments.length > 1 ? 's' : ''
    const announcement = `${apartments.length} new ${shortTerm}${apartments[0].area} release${grammar}!`
    content.subject = announcement
    content.html = `SSSB just released ${announcement}\n Here's the apartment${grammar}:\n</hr>`
    apartments.forEach(ap => {
      content.html += '<p>Area: ' + ap.area + '</p>'
      content.html += '<p>Floor: ' + ap.floor + '</p>'
      content.html += '<p>Apartment number: ' + ap.adress.slice(-4) + '</p>'
      content.html += "<p>Book it <a href='" + ap.link + "'> here <a/></p>"
      content.html += '<hr>'
    })
  }
  return content
}

const generateSpecificContent = apartments => generateContent(apartments, false)
const generateShortTermContent = apartments => generateContent(apartments, true)

const decideEmail = (role, apartments) => {
  const { admin, subscriber } = options
  switch (role) {
    case 'admin':
      send(admin)
      break
    case 'subscriber':
      send(subscriber)
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
      send(admin)
  }
}

module.exports = {
  sendEmail: (role, apartments) => {
    decideEmail(role, apartments)
  }
}
