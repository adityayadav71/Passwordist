const mongoose = require("mongoose");

const greivanceSchema = new mongoose.Schema(
  {
    username: { type: String },
    first_name: { type: String },
    email: { type: String },
    country: { type: String },
    subject: { type: String },
  },
  { collection: "greivance" }
);

module.exports = mongoose.model("Greivance", greivanceSchema);
