const sgEmail = require("@sendgrid/mail");
require("dotenv").config();

const { SENDGRID_KEY } = process.env;

sgEmail.setApiKey(SENDGRID_KEY);

const sendEmail = async (data) => {
  const email = { ...data, from: "oksanarobeiko@gmail.com" };
  await sgEmail.send(email);
  return true;
};

module.exports = sendEmail;
