"use strict";
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_ACCOUNT,
    pass: process.env.GMAIL_PASSWORD
  }
});

const sendEmail = (to, subject, text, html) => {
  // setup email data with unicode symbols
  const mailOptions = {
    from: process.env.GMAIL_ACCOUNT, // sender address
    to: to,
    subject: subject, // Subject line
    text: text, // plain text body
    html: html // html body
  };

  // send mail with defined transport object
  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmail: sendEmail
};
