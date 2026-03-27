const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;

// GET USER PROFILE
exports.getProfile = async (req, res) => {

    try {

        const token = req.query.token;

        if (!token) {
            return res.status(401).send("Unauthorized");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user_id;

        const [rows] = await db.query(`
            SELECT email, role, first_name, last_name, passport, address, telephone, profile_picture
            FROM users
            WHERE user_id = ?
        `, [userId]);

        if (rows.length === 0) {
            return res.status(404).send("User not found");
        }

        res.render('editProfile', {
            user: rows[0],
            token: token
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Server error");

    }

};

// UPDATE PROFILE / PASSWORD
exports.updateProfile = async (req, res) => {

    try {

        const token = req.query.token;

        if (!token) {
            return res.status(401).send("Unauthorized");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user_id;

        const { first_name, last_name, address, telephone, password } = req.body;

        // CHANGE PASSWORD
        if (password && password.trim().length > 0) {

            const hashedPassword = await bcrypt.hash(password, 10);

            await db.query(`
                UPDATE users
                SET password=?
                WHERE user_id=?
            `, [hashedPassword, userId]);

        }

        // UPDATE PROFILE
        else if (first_name || last_name || address || telephone) {

            await db.query(`
                UPDATE users
                SET first_name=?, last_name=?, address=?, telephone=?
                WHERE user_id=?
            `, [
                first_name,
                last_name,
                address,
                telephone,
                userId
            ]);

        }


        res.redirect('/editProfile?token=' + token);

    } catch (err) {

        console.error(err);
        res.status(500).send("Update failed");

    }

};

// UPDATE PROFILE / PROFILE PICTURE

exports.uploadProfilePicture = async (req, res) => {
    try {
        const token = req.query.token;
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user_id;

        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        // delete old image if exists
        const [rows] = await db.query("SELECT profile_picture FROM users WHERE user_id=?", [userId]);

        if (rows[0]?.profile_picture) {
            const oldPath = `public/${rows[0].profile_picture}`;
            try {
                await fs.unlink(oldPath);
                console.log(`Deleted old image: ${oldPath}`);
            } catch (err) {
                console.warn(`Old image could not be deleted: ${oldPath}`, err.message);
            }
        }

        const imagePath = `assets/propics/${req.file.filename}`;

        await db.query("UPDATE users SET profile_picture=? WHERE user_id=?", [imagePath, userId]);

        res.json({ message: "Upload success", path: imagePath });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Upload failed" });
    }
};

// GET PROFILE PICTURE
// GET PROFILE PICTURE
exports.getProfilePicture = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;

    const [rows] = await db.query(
      "SELECT profile_picture FROM users WHERE user_id=?",
      [userId]
    );

    if (!rows[0]?.profile_picture) {
      return res.json({ path: "/assets/propics/profile_image.jpg" }); // default
    }

    res.json({ path: "/" + rows[0].profile_picture });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch profile picture" });
  }
};