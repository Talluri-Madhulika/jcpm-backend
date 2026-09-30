const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const User = require("../models/User");

const router = express.Router();


// =====================================================
// EMAIL CONFIGURATION
// =====================================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


// =====================================================
// ADMIN AUTH MIDDLEWARE
// =====================================================

const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Admin authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "jcpm-secret-key"
    );

    const user = await User.findById(decoded.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required.",
      });
    }

    req.user = user;

    next();

  } catch (error) {
    console.error("Admin Authentication Error:", error);

    return res.status(401).json({
      message: "Invalid or expired authentication.",
    });
  }
};


// =====================================================
// SIGNUP
// =====================================================

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Signup Error:", error);

    res.status(500).json({
      message: "Server error during signup.",
    });
  }
});


// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET || "jcpm-secret-key",
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful.",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      message: "Server error during login.",
    });
  }
});


// =====================================================
// ADMIN SETTINGS
// =====================================================

const PERMANENT_ADMIN_EMAIL =
  process.env.PERMANENT_ADMIN_EMAIL ||
  "tallurimadhulika@gmail.com";

const MAX_ADMINS = 4;
const MAX_CHANGEABLE_ADMINS = 3;


// =====================================================
// GET ALL USERS — ADMIN ONLY
// =====================================================

router.get("/users", requireAdmin, async (req, res) => {
  try {

    const users = await User.find()
      .select("_id name email role createdAt")
      .sort({ createdAt: 1 });

    const adminCount = await User.countDocuments({
      role: "admin"
    });

    const formattedUsers = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      isPermanent:
        user.email.toLowerCase() ===
        PERMANENT_ADMIN_EMAIL.toLowerCase()
    }));

    res.json({
      users: formattedUsers,
      adminCount,
      maxAdmins: MAX_ADMINS,
      changeableAdmins: MAX_CHANGEABLE_ADMINS,
      permanentAdminEmail: PERMANENT_ADMIN_EMAIL
    });

  } catch (error) {

    console.error("Get Users Error:", error);

    res.status(500).json({
      message: "Failed to load users."
    });

  }
});


// =====================================================
// MAKE USER ADMIN — ADMIN ONLY
// =====================================================

router.put("/users/:id/make-admin", requireAdmin, async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        message: "This user is already an admin."
      });
    }

    const adminCount = await User.countDocuments({
      role: "admin"
    });

    if (adminCount >= MAX_ADMINS) {
      return res.status(400).json({
        message:
          "Maximum 4 admins are allowed: 1 permanent admin and 3 changeable admins."
      });
    }

    user.role = "admin";
    await user.save();

    res.json({
      message: `${user.name} is now an admin.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPermanent: false
      },
      adminCount: adminCount + 1,
      maxAdmins: MAX_ADMINS,
      changeableAdmins: MAX_CHANGEABLE_ADMINS
    });

  } catch (error) {

    console.error("Make Admin Error:", error);

    res.status(500).json({
      message: "Failed to make user admin."
    });

  }
});


// =====================================================
// REMOVE ADMIN — ADMIN ONLY
// =====================================================

router.put("/users/:id/remove-admin", requireAdmin, async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    if (
      user.email.toLowerCase() ===
      PERMANENT_ADMIN_EMAIL.toLowerCase()
    ) {
      return res.status(403).json({
        message: "The permanent admin cannot be removed."
      });
    }

    if (user.role !== "admin") {
      return res.status(400).json({
        message: "This user is not an admin."
      });
    }

    user.role = "user";
    await user.save();

    const adminCount = await User.countDocuments({
      role: "admin"
    });

    res.json({
      message: `${user.name} is no longer an admin.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPermanent: false
      },
      adminCount,
      maxAdmins: MAX_ADMINS,
      changeableAdmins: MAX_CHANGEABLE_ADMINS
    });

  } catch (error) {

    console.error("Remove Admin Error:", error);

    res.status(500).json({
      message: "Failed to remove admin."
    });

  }
});


// =====================================================
// FORGOT PASSWORD
// =====================================================

router.post("/forgot-password", async (req, res) => {
  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;

    await user.save();

    const resetLink =
      `${process.env.FRONTEND_URL || "http://localhost:4200"}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"JCPM ELURU" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "JCPM ELURU - Reset Your Password",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          background: #f7f6fb;
        ">

          <div style="
            background: white;
            padding: 30px;
            border-radius: 16px;
            text-align: center;
          ">

            <h2 style="color:#211c55;">
              JCPM ELURU
            </h2>

            <p style="color:#555;">
              We received a request to reset your password.
            </p>

            <p style="color:#555;">
              Click the button below to create a new password.
            </p>

            <a
              href="${resetLink}"
              style="
                display:inline-block;
                padding:12px 22px;
                background:#6d55d9;
                color:white;
                text-decoration:none;
                border-radius:8px;
                margin:20px 0;
              "
            >
              Reset Password
            </a>

            <p style="
              color:#888;
              font-size:12px;
            ">
              This link will expire in 15 minutes.
            </p>

            <p style="
              color:#999;
              font-size:11px;
            ">
              If you did not request this, you can safely ignore this email.
            </p>

          </div>

        </div>
      `,
    });

    res.json({
      message:
        "If an account exists with this email, a reset link has been sent.",
    });

  } catch (error) {

    console.error("Forgot Password Error:", error);

    res.status(500).json({
      message: "Unable to send password reset email.",
    });
  }
});


// =====================================================
// RESET PASSWORD
// =====================================================

router.post("/reset-password", async (req, res) => {
  try {

    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and new password are required.",
      });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or expired.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({
      message: "Password reset successfully.",
    });

  } catch (error) {

    console.error("Reset Password Error:", error);

    res.status(500).json({
      message: "Unable to reset password.",
    });
  }
});


module.exports = router;