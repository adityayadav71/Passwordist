const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cardsSchema = new mongoose.Schema(
    {
        username: {type: String},
        bank_name: {type: String},
        bank_website: {type: String},
        card_type: {type: String},
        card_number: {type: String},
        card_holder_name: {type: String},
        expiry_date: {type: String},
        CVV: {type: String}
    },
    {collection: 'cards'}
); 

module.exports = mongoose.model("Cards", cardsSchema);