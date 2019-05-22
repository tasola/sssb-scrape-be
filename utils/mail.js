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

const send = (type) => {
  transporter.sendMail(type, (error, info) => {
    if (error) return console.log(error)
    else console.log("The message was sent")
    console.log(info)
  });
}

const decideEmail = (role) => {
  switch(role){
    case "admin":
      send(adminOptions);
      break;
    case "subscriber":
      send(subscriberOptions)
      break;
    default:
      send(adminOptions);
  }
}

module.exports = {
  sendEmail: (role) => {
    decideEmail(role);
  }
}