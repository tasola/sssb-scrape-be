const nodemailer = require("nodemailer");
require('dotenv').config()

mailConfig = {
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID,
  },
};


// mailConfig = {
//   service: "hotmail",
// secureConnection: false,
// port: 465,
// auth: {
//   user: "pollisti@hotmail.com",
//   pass: process.env.HOTMAIL,
// },
// tls: {
//   ciphers:'SSLv3'
// }
// }

let transporter = nodemailer.createTransport(mailConfig);

let adminOptions = {
  from: 'SSSB Info <sssb-scrape@hotmail.com>',
  to: "petter.tk@hotmail.com",
  subject: "Server Information",
  text: "Lägenhetslistan är tom. Förmodligen är servern nystartad, annars kan det vara värt att kolla upp."
}

let subscriberOptions = {
  from: 'SSSB Info <sssb-scrape@hotmail.com>',
  to: "petter.tk@hotmail.com",
  subject: "SSSB subscription",
  text: "Det har släppts nya läggor din sjuke fan"
}

let nyponOptions = {
  from: 'SSSB Info <sssb-scrape@hotmail.com>',
  to: "petter.tk@hotmail.com",
  subject: "NYPONET UTE",
  text: "Nyponet har släppts!\n\n" +
        "Lägenhetsnummer: " + 
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'https://localhost:3000/organisation/reset-request/submit?token=' +
        "Asfasfasfa1231241421asfasfsa" +
        '\n\n'
}

const send = (type) => {
  transporter.sendMail(type, (error, info) => {
    if (error) return console.log(error)
    else console.log("The message was sent")
    console.log(info)
    nyponOptions.text = "Nyponet har släppts! Lägenhetsnummer: "
  });
}

const decideEmail = (role, apartments) => {
  if (apartments){
    apartments.forEach((ap) => {
      nyponOptions.text += ap + " ";
    })
  }
  switch(role){
    case "admin":
      send(adminOptions);
      break;
    case "subscriber":
      send(subscriberOptions)
      break;
    case "nypon":
      send(nyponOptions)
      break;
    default:
      send(adminOptions);
  }
}

module.exports = {
  sendEmail: (role, apartments) => {
    decideEmail(role, apartments);
  }
}