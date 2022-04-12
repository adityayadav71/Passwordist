const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SessionsSchema = new mongoose.Schema(
    {
        SessionID:{type: String},
        username: {type: String},
        email: {type: String},
        otp: {type: String},
        accessed: {type: Date, default: () => Date.now()},
        createdOn: {type: Date, default: () => Date.now()},
    },
    {collection: 'sessions'}
); 

const Sessions = mongoose.model("Sessions", SessionsSchema);
module.exports = {Sessions}