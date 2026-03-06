const {
  sendVerificationCode,
  verifyVerificationCode
} = require('../services/emailVerificationService');

async function sendCode(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  try {
    await sendVerificationCode(email);

    res.json({
      success: true,
      message: 'Verification code sent'
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Failed to send verification code'
    });
  }
}

function verifyCode(req, res) {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: 'Email and code are required'
    });
  }

  const result = verifyVerificationCode(email, code);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
}

module.exports = {
  sendCode,
  verifyCode
};