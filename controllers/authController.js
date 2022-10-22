const nodemailer = require("nodemailer");
const User = require("../models/User");

function between(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
random = between(100000, 999999).toString();
const defaultSweetAlertOptions = {
  message: "",
  title: "",
  icon: "",
  confirmButtonText: "",
  saved: false,
};

exports.index = (req, res, next) => {
  if (
    req.session.loggedin === "false" ||
    req.session.loggedin === undefined ||
    req.session.loggedin === "undefined"
  ) {
    req.session.loggedin = "undefined";
    res.render("../views/pages/index.ejs", {
      message: "",
      username: req.session.username,
      loggedin: "false",
      title: "Error!",
      icon: "error",
      confirmButtonText: "Try again",
    });
  } else {
    req.session.lastaccessed = Date.now();
    res.render("../views/pages/index.ejs", {
      message: "",
      username: req.session.username,
      loggedin: "true",
      title: "Error!",
      icon: "error",
      confirmButtonText: "Try again",
    });
  }
  next();
};

exports.getLoginPage = async (req, res) => {
  if (req.session !== undefined) {
    res.render("../views/pages/vault.ejs", {
      email: req.session.email,
    });
  } else {
    res.render("../views/pages/Login.ejs", {
      message: "",
      title: "",
      icon: "",
      confirmButtonText: "",
    });
  }
};

exports.authenticateUser = (req, res, next) => {
  if (
    req.session.loggedin === undefined ||
    req.session.loggedin === "undefined"
  ) {
    res.render("../views/pages/Login.ejs", defaultSweetAlertOptions);
  } else {
    next();
  }
};

exports.signup = async (req, res) => {
  var email = req.body.email;
  var username = req.body.username;
  req.session.username = username;
  req.session.email = email;
  req.session.otp = random;
  req.session.loggedin = "false";
  req.session.lastaccessed = Date.now();
  req.session.createdOn = Date.now();
  async function emailexists(email) {
    try {
      var Exists = await User.findOne({ email: email }).exec();
    } catch (err) {
      console.error(err);
    }
    return Exists !== null;
  }
  if ((await User.findOne({ username: username }).exec()) !== null) {
    res.render("../views/pages/index.ejs", {
      message: "Username already registered",
      username: req.session.username,
      loggedin: false,
      title: "Error!",
      icon: "error",
      confirmButtonText: "Try again",
    });
  }
  if (await emailexists(email)) {
    res.render("../views/pages/index.ejs", {
      message: "Email already registered",
      username: req.session.username,
      loggedin: false,
      title: "Error!",
      icon: "error",
      confirmButtonText: "Try again",
    });
  } else {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "pwdt1088@gmail.com",
          pass: "hagtcjxebiprcqlz",
        },
      });
      const options = {
        from: "pwdt1088@gmail.com",
        to: email,
        subject: "Your Account Activation Code: ",
        html: `<h1> Welcome aboard!</h1><h2>Your Email was recently used to register at Passwordist, activate your account using the below code:</h2><p style="text-align: center; font-size: x-large;"><b>${random}</b></p>`,
      };
      transporter.sendMail(options, function (err, info) {
        if (err) {
          console.log(err);
        }
      });
      res.render("../views/pages/verify_otp.ejs", {
        email: email,
        message: "",
      });
    } catch (error) {
      console.log(error);
    }
  }
};

exports.validateOTP = async (req, res) => {
  const givenotp = req.session.otp;
  var otpstring =
    req.body.first +
    req.body.second +
    req.body.third +
    req.body.fourth +
    req.body.fifth +
    req.body.sixth;
  var inputotp = otpstring.toString();
  if (givenotp === inputotp) {
    var user = new User({
      username: req.session.username,
      email: req.session.email,
      createdOn: req.session.createdOn,
    });
    user.save(),
      function (err, collection) {
        if (err) {
          throw err;
        }
        console.log("User Created Successfully!");
      };
    res.render("../views/pages/MasterPassword.ejs", {
      username: req.session.username,
      message: "",
      title: "",
      icon: "",
      confirmButtonText: "",
    });
  } else {
    res.render("../views/pages/verify_otp.ejs", {
      email: req.session.email,
      message: "Invalid OTP",
    });
  }
};

exports.login = (req, res) => {
  User.findOne({ email: req.body.email }).exec(function (error, user) {
    if (error) {
      callback({ error: true });
    } else if (!user) {
      res.render("../views/pages/login.ejs", {
        message: "No user with that email",
        title: "Error!",
        icon: "error",
        confirmButtonText: "Try again",
      });
    } else {
      user.comparePassword(req.body.password, function (matchError, isMatch) {
        if (matchError) {
          res.render("../views/pages/Login.ejs", {
            message: "Match Error",
            title: "Error!",
            icon: "error",
            confirmButtonText: "Try again",
          });
        } else if (!isMatch) {
          res.render("../views/pages/Login.ejs", {
            message: "Invalid Password",
            title: "Error!",
            icon: "error",
            confirmButtonText: "Try again",
          });
        } else {
          req.session.username = user.username;
          req.session.email = user.email;
          req.session.otp = user.otp;
          req.session.loggedin = "true";
          req.session.lastaccessed = Date.now();
          res.render("../views/pages/vault.ejs", {
            email: req.session.email,
          });
        }
      });
    }
  });
};

exports.logout = (req, res) => {
  if (req.session.loggedin !== undefined || req.session.loggedin === "true") {
    req.session.loggedin = "false";
    req.session.destroy();
  }
  res.render("../views/pages/index.ejs", {
    message: "You have been logged out successfully",
    username: "",
    loggedin: false,
    title: "LOGGED OUT!",
    icon: "success",
    confirmButtonText: "OK",
  });
};
