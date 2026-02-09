const axios = require("axios");
const { db } = require("../../config/firebase");

module.exports = async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(403).json({ error: "User record not found" });
    }

    const user = snapshot.docs[0].data();

    if (user.status !== "active") {
      return res.status(403).json({ error: "Account not verified" });
    }

    res.json({
    message: "Login successful.",
    idToken: response.data.idToken,
    refreshToken: response.data.refreshToken,
    expiresIn: response.data.expiresIn,
    });


  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(401).json({
      error: error.response?.data?.error?.message || "Invalid email or password",
    });
  }
};
