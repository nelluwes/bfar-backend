const crypto = require("crypto");
const transporter = require("../../utils/mailer.util");
const { db } = require("../../config/firebase");

module.exports = async (req, res) => {
  try {
    const { email } = req.body;

    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "User not found" });
    }

    const userDoc = snapshot.docs[0];
    const userRef = userDoc.ref;

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpiry = Date.now() + 15 * 60 * 1000;

    await userRef.update({
      resetToken,
      resetExpiry,
    });

    const resetLink = `${process.env.FRONTEND_RESET_URL}?token=${resetToken}`;

    await transporter.sendMail({
      from: `"BFAR Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>You requested to reset your password.</p>
        <p>Click the link below to continue:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.json({ message: "Password reset link sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error sending password reset link",
      error: err.message,
    });
  }
};
