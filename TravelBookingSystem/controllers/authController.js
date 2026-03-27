const {
  registerUser,
  loginUser,
  resetUserPassword
} = require('../services/authService');

// REGISTER
const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);

    res.json({
      message: 'User registered',
      userId: result.insertId
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await loginUser(email, password);

    // ✅ STORE SESSION (NEW)
    req.session.user = user;
    console.log("SESSION AFTER LOGIN:", req.session);

    // DELETE LATER (JWT START)
    res.json({
      message: "Login successful",
      token
    });
    // DELETE LATER (JWT END)

    // ✅ FINAL VERSION WILL BE:
    // res.json({ message: "Login successful" });

  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ message: err.message });
    }

    if (err.message === 'Invalid credentials') {
      return res.status(401).json({ message: err.message });
    }

    res.status(500).json({ message: err.message });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    await resetUserPassword(email, password);

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: err.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: err.message
    });
  }
};

// ✅ GET CURRENT USER (SESSION)
const getCurrentUser = (req, res) => {
  if (req.session && req.session.user) {
    //console.log("Returning session user:", req.session.user);
    res.json(req.session.user); // ✅ send user to frontend
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};

// ✅ LOGOUT
const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }

    res.json({ message: "Logged out successfully" });
  });
};

module.exports = {
  register,
  login,
  resetPassword,
  getCurrentUser,
  logout
};