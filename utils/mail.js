const nodemailer = require("nodemailer");
require('dotenv').config()

let transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 25,
  auth: {
    user: "pollisti123@gmail.com",
    pass: process.env.GMAIL,
  },
  tls: {
    rejectUnauthorized: true
  }
});

let adminOptions = {
  form: 'pollisti123@gmail.com',
  to: "petter.tk@hotmail.com",
  subject: "Server Information",
  text: "Lägenhetslistan är tom. Förmodligen är servern nystartad, annars kan det vara värt att kolla upp."
}

let subscriberOptions = {
  form: 'pollisti123@gmail.com',
  to: "petter.tk@hotmail.com",
  subject: "SSSB subscription",
  text: "Det har släppts nya läggor din sjuke fan"
}

let nyponOptions = {
  form: 'pollisti123@gmail.com',
  to: "petter.tk@hotmail.com",
  subject: "NYPONET UTE",
  text: "Nyponet har släppts! Lägenhetsnummer: "
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