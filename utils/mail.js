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

let helperOpt = {
  form: 'pollisti123@gmail.com',
  to: "petter.tk@hotmail.com",
  subject: "SSSB test",
  text: "Det har släppts nya läggor din sjuke fan"
}

module.exports = {
  sendEmail: () => {
      transporter.sendMail(helperOpt, (error, info) => {
          if (error) return console.log(error)
          else console.log("The message was sent")
          console.log(info)
      });
  }
}