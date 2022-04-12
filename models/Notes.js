const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notesSchema = new mongoose.Schema(
    {
        username: {type: String},
        title: {type: String},
        date: {type: String},
        color: {type: String},
        time: {type: String},
        note: {type: String}
    },
    {collection: 'notes'}
); 

module.exports = mongoose.model("Notes", notesSchema);