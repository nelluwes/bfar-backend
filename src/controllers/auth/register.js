const { admin, db } = require("../../config/firebase");
const transporter = require("../../utils/mailer.util");
const crypto = require("crypto");

module.exports = async (req, res) => {
  const { first_name, middle_name, last_name, email, password } = req.body;

  try {
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        error: "First name, last name, email, and password are required",
      });
    }

    // Create Firebase Auth user
    const user = await admin.auth().createUser({
      email,
      password,
    });

    // Tokens
    const verification_code = crypto.randomBytes(32).toString("hex");
    const api_key = crypto.randomBytes(32).toString("hex");
    const csrf_token = crypto.randomBytes(32).toString("hex");

    const userData = {
      user_id: user.uid,
      first_name,
      middle_name: middle_name || null,
      last_name,
      email,

      // Auth-related
      password_hash: null, // handled by Firebase Auth
      api_key,
      csrf_token,

      // Account state
      status: "verifying",
      verification_code,
      reset_password_token: null,

      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("users").doc(user.uid).set(userData);

    const verifyLink = `${process.env.FRONTEND_VERIFY_URL}?token=${verification_code}`;

    await transporter.sendMail({
      from: `"BFAR Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Account",
      html: `
        <h2>Welcome to BFAR</h2>
        <p>Please verify your account by clicking the link below:</p>
        <a href="${verifyLink}">${verifyLink}</a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    res.status(201).json({
      message: "Registration successful. Verification link sent.",
    });
  } catch (error) {
    console.error(error);

    // Cleanup auth user if Firestore write failed
    if (email) {
      const existingUser = await admin
        .auth()
        .getUserByEmail(email)
        .catch(() => null);

      if (existingUser) {
        await admin.auth().deleteUser(existingUser.uid);
      }
    }

    res.status(400).json({ error: error.message });
  }
};
