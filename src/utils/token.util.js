const crypto = require("crypto");

exports.generateApiKey = () =>
  crypto.randomBytes(32).toString("hex");

exports.generateCsrfToken = () =>
  crypto.randomBytes(24).toString("hex");

exports.generateVerificationCode = () =>
  crypto.randomBytes(3).toString("hex");
