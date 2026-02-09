require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/auth_routes");
const { admin, db } = require("./src/config/firebase");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/test", async (req, res) => {
  const snapshot = await db.collection("users").limit(1).get();
  res.json(snapshot.docs.map(d => d.data()));
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

