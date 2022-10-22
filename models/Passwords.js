const mongoose = require("mongoose");

const PasswordsSchema = new mongoose.Schema(
  {
    username: { type: String },
    website_name: { type: String },
    website_url: { type: String },
    website_username: { type: String },
    website_password: { type: String },
    iv: { type: String },
  },
  { collection: "passwords" }
);
module.exports = mongoose.model("Passwords", PasswordsSchema);
