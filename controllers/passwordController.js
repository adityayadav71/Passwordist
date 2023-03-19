const bcrypt = require("bcrypt");
const User = require("../models/User");

exports.generatePassword = (req, res) => {
  res.render("../views/pages/generate_password.ejs");
};

exports.getMasterPassword = (req, res) => {
  if (req.session) {
    res.render("../views/pages/MasterPassword.ejs", {
      username: req.session.id,
      message: "",
      title: "",
      icon: "",
      confirmButtonText: "",
    });
  } else {
    res.render("../views/pages/Login.ejs", {
      message: "",
    });
  }
};

exports.setMasterPassword = async (req, res) => {
  var password = req.body.master;
  var confirmation = req.body.confirmpass;
  if (password === confirmation) {
    try {
      await User.findOneAndUpdate(
        { email: req.session.email },
        {
          $set: { password: await bcrypt.hash(password, 12) },
          lastUpdatedPasswordOn: Date.now(),
        }
      ).exec();
      res.render("../views/pages/Login.ejs", {
        message: "Master password set successfully, you can now login to your vault!",
        title: "CREATED!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (err) {
      console.error(err);
    }
  } else {
    res.render("../views/pages/MasterPassword.ejs", {
      username: req.session.username,
      message: "Passwords do not match!",
    });
  }
};
