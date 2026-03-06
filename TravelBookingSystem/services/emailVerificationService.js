const nodemailer = require("nodemailer");

const verificationCodes = {};

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send verification code
async function sendVerificationCode(email) {

  email = email.toLowerCase();

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  verificationCodes[email] = {
    code,
    expires: Date.now() + 60000,
    attempts: 0
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "TripZip Email Verification Code",
    text: `Your verification code is: ${code}. It expires in 1 minute.`
  };

  await transporter.sendMail(mailOptions);
}

// Verify code
function verifyVerificationCode(email, code) {

  email = email.toLowerCase();

  const record = verificationCodes[email];

  if (!record) {
    return {
      success: false,
      message: "No verification code sent"
    };
  }

  if (Date.now() > record.expires) {
    delete verificationCodes[email];
    return {
      success: false,
      message: "Code expired"
    };
  }

  record.attempts++;

  if (record.attempts > 5) {
    delete verificationCodes[email];
    return {
      success: false,
      message: "Too many attempts"
    };
  }

  if (record.code !== code) {
    return {
      success: false,
      message: "Invalid verification code"
    };
  }

  delete verificationCodes[email];

  return {
    success: true,
    message: "Email verified"
  };
}

module.exports = {
  sendVerificationCode,
  verifyVerificationCode
};