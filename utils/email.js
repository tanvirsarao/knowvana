const nodemailer = require('nodemailer');

const sendEmail = async options => {
  //transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  //email options
  const mailOptions = {
    from: 'Tanvir Sarao <tsarao@uwaterloo.ca>',
    to: options.email,
    subject: options.subject,
    text: options.message
    //html:
  };

  //send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
