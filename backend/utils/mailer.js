const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "danial.johnson@ethereal.email",
    pass: "TB5QzuQbymTDWtAxhe",
  },
});

module.exports = transporter;