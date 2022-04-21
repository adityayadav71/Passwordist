const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new mongoose.Schema(
    {
        username: {type: String},
        first_name: {type: String},
        last_name: {type: String},
        company_name: {type: String},
        address: {type: String},
        city: {type: String},
        country: {type: String},
        postalcode: {type: String}
    },
    {collection: 'address'}
); 

module.exports = mongoose.model("Addresses", addressSchema);