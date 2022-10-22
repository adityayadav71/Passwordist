const mongoose = require("mongoose");

const accountsSchema = new mongoose.Schema(
  {
    username: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    bank_name: { type: String },
    account_type: { type: String },
    account_number: { type: String },
    IFSC: { type: String },
    branch_address: { type: String },
    website_url: { type: String },
  },
  { collection: "banks" }
);

module.exports = mongoose.model("Accounts", accountsSchema);
