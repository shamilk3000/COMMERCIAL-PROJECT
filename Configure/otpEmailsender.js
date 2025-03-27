const nodemailer = require("nodemailer");
require("dotenv").config();
const env = process.env;

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", 
      port: 587,
      secure: false, 
      auth: {
        user: "shamilshalusml@gmail.com", 
        pass: "ooqr kftt vpmr bkcy", 
      },
    });

    await transporter.sendMail({
      from: "shamilk3000@gmail.com",
      to: email,
      subject,
      text,
    });

  } catch (error) {
    console.error("Email sending failed", error);
  }
};

module.exports = sendEmail;
