const nodemailer = require('nodemailer')
const options = require('./options')
const doNotLog = process.env.NODE_ENV === 'test'
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

const send = content => {
  if (process.env.NODE_ENV !== 'production') {
    sendDev(content)
  } else {
    sendProd(content)
  }
}

const sendDev = content => {
  if (doNotLog) return
  console.log('In prod this mail would have been sent with data:\n ')
  console.log(content)
}

const sendProd = content => {
  transporter.sendMail(content, (error, info) => {
    if (error) return console.log(error)
    else console.log('The message was sent')
    console.log(info)
    console.log('\n')
  })
}

const generateContent = (apartments, recipient, isShortTerm) => {
  let template = options.template
  let content = Object.assign({}, template)
  content.to = recipient
  const shortTerm = isShortTerm ? 'SHORT TERM ' : ''
  if (apartments) {
    const grammar = apartments.length > 1 ? 's' : ''
    const announcement = `${
      apartments.length
    } new ${shortTerm}${getAllUniqueAreas(apartments)} release${grammar}!`
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

generateAdminNotification = (usersSubscriptions, adminEmail) => {
  let template = options.template
  let content = Object.assign({}, template)
  const usersObjectKeys = Object.keys(usersSubscriptions)
  content.to = adminEmail
  content.subject = 'New batch has been mailed to some users'
  content.html = 'Here is the object that has been iterated and mailed'
  usersObjectKeys.forEach(userEmail => {
    content.html += '<p>Email: ' + userEmail + '</p>'
    content.html += '<p>Preferences: </p>'
    usersSubscriptions[userEmail].forEach(area => {
      content.html += '<p>' + area.adress + '</p>'
    })
    content.html += '<hr>'
  })

  return content
}

// List every unique area name, separated by commas. The last two objects are separated by a '&'
const getAllUniqueAreas = apartments => {
  let areas = ''
  let listedAreas = []
  apartments.forEach(ap => {
    if (!listedAreas.includes(ap.area)) {
      areas += ap.area + ', '
      listedAreas.push(ap.area)
    }
  })
  areas = areas.substring(0, areas.length - 2)
  const pos = areas.lastIndexOf(',')
  if (listedAreas.length > 1)
    areas = areas.substring(0, pos) + ' &' + areas.substring(pos + 1)
  return areas
}

const generateGeneralContent = (apartments, recipient) =>
  generateContent(apartments, recipient, false)

const generateShortTermContent = (apartments, recipient) =>
  generateContent(apartments, recipient, true)

module.exports = {
  generateContent,
  getAllUniqueAreas,
  generateShortTermContent,
  generateGeneralContent,
  generateAdminNotification,
  send
}
