const nodemailer = require('nodemailer');

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "c56aff9ea43cc4",
      pass: "7b9ba283550777"
    }
  });