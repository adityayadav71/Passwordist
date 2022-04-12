const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
    {
        username:{type: String},
        email: {type: String},
        password:{type: Object, required: false},
        createdOn: {type: Date, default: () => Date.now()},
        lastUpdatedPasswordOn: {type: Date, default: () => Date.now()},
    },
    {collection: 'user'}
); 
userSchema.methods.comparePassword = function(password, callback) {
    bcrypt.compare(password, this.password, function(error, isMatch) {
      if (error) {
        return callback(error)
      } else {
        callback(null, isMatch)
      }
    })
  }
module.exports = mongoose.model("User", userSchema);