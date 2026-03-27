const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
const User = require('../models/userModel');

// ================= GET PROFILE =================
exports.getProfile = async (req, res) => {
  try {
    const userId = req.session.user?.user_id;

    if (!userId) return res.status(401).send("Unauthorized");

    const user = await User.getUserById(userId);

    if (!user) return res.status(404).send("User not found");

    res.render('editProfile', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// ================= UPDATE PROFILE / PASSWORD =================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.session.user?.user_id;

    if (!userId) return res.status(401).send("Unauthorized");

    const { first_name, last_name, address, telephone, password } = req.body;

    // CHANGE PASSWORD
    if (password && password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.updateUserPassword(userId, hashedPassword);
    }

    // UPDATE PROFILE
    if (first_name || last_name || address || telephone) {
      await User.updateUserProfile(userId, { first_name, last_name, address, telephone });
    }

    res.redirect('/editProfile');
  } catch (err) {
    console.error(err);
    res.status(500).send("Update failed");
  }
};

// ================= UPLOAD PROFILE PICTURE =================
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.session.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Delete old image if exists
    const oldImage = await User.getProfilePicture(userId);
    if (oldImage) {
      const oldPath = path.join('public', oldImage);
      try {
        await fs.unlink(oldPath);
        console.log(`Deleted old image: ${oldPath}`);
      } catch (err) {
        console.warn(`Could not delete old image: ${oldPath}`, err.message);
      }
    }

    // Update DB with new image path
    const imagePath = `assets/propics/${req.file.filename}`;
    await User.updateProfilePicture(userId, imagePath);

    res.json({ message: "Upload success", path: imagePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

// ================= GET PROFILE PICTURE =================
exports.getProfilePicture = async (req, res) => {
  try {
    const userId = req.session.user?.user_id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const profilePic = await User.getProfilePicture(userId);
    res.json({ path: profilePic ? "/" + profilePic : "/assets/propics/profile_image.jpg" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch profile picture" });
  }
};