const { admin, db } = require("../../config/firebase");

module.exports = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    const snapshot = await db
      .collection("users")
      .where("resetToken", "==", token)
      .where("resetExpiry", ">", Date.now())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(400).json({
        message: "Invalid or expired reset link",
      });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Update Firebase Auth password
    await admin.auth().updateUser(userData.user_id, {
      password: newPassword,
    });

    // Clear reset token
    await userDoc.ref.update({
      resetToken: null,
      resetExpiry: null,
    });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error resetting password",
      error: err.message,
    });
  }
};
