const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accountsSchema = new mongoose.Schema(
    {
        username: {type: String},
        title: {type: String},
        date: {type: String},
        time: {type: String},
        note: {type: String},
    },
    {collection: 'banks'}
); 

module.exports = mongoose.model("Accounts", accountsSchema);