const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PasswordsSchema = new mongoose.Schema(
    {
        username: {type: String},
        title: {type: String},
        date: {type: String},
        time: {type: String},
        note: {type: String},
    },
    {collection: 'passwords'}
); 

module.exports = mongoose.model("Passwords", PasswordsSchema);