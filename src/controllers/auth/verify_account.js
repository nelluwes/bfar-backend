const { db, admin } = require("../../config/firebase");

module.exports = async (req, res) => {
  const { token } = req.query;

  try {
    const snapshot = await db
      .collection("users")
      .where("verifyToken", "==", token)
      .where("verifyExpiry", ">", Date.now())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(400).json({
        error: "Invalid or expired verification link",
      });
    }

    const userDoc = snapshot.docs[0];

    await userDoc.ref.update({
      status: "active",
      verifyToken: null,
      verifyExpiry: null,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: "Account verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
