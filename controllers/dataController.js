const { encrypt, decrypt } = require("../public/js/EncryptionHandler.js");
const Notes = require("../models/Notes");
const Cards = require("../models/Cards");
const Address = require("../models/Addresses");
const Accounts = require("../models/Accounts");
const Passwords = require("../models/Passwords");
const handleError = require("../utils/handleError");

const defaultSweetAlertOptions = {
  message: "",
  title: "",
  icon: "",
  confirmButtonText: "",
  saved: false,
};

const successOptions = (card, change) => {
  const options = {
    message: `${card} ${change} successfully`,
    title: "CREATED!",
    icon: "success",
    confirmButtonText: "OK",
    saved: true,
  };
  return options;
};

// 1. SAVE PASSWORDS
exports.savePasswords = async (req, res) => {
  try {
    var web_pass = req.body.site_password;
    const encryptedPassword = encrypt(web_pass);
    await new Passwords({
      username: req.session.username,
      website_name: req.body.website_name,
      website_url: req.body.website_url,
      website_username: req.body.site_username,
      website_password: encryptedPassword.password,
      iv: encryptedPassword.iv,
    }).save();
    res.render("../views/partials/_passwords.ejs", successOptions("Password", "saved"));
  } catch (error) {
    handleError(error);
  }
};
exports.saveNotes = async (req, res) => {
  try {
    await new Notes({
      username: req.session.username,
      title: req.body.title,
      date: req.body.date,
      color: req.body.color,
      time: req.body.time,
      note: req.body.note,
    }).save();
    res.render("../views/partials/_notes.ejs", successOptions("Note", "saved"));
  } catch (error) {
    handleError(error);
  }
};
exports.saveAddresses = async (req, res) => {
  try {
    await new Address({
      username: req.session.username,
      first_name: req.body.fname,
      last_name: req.body.lname,
      company_name: req.body.companyname,
      address: req.body.address,
      city: req.body.city,
      country: req.body.country,
      state: req.body.state,
      postalcode: req.body.postalcode,
    }).save();
    res.render("../views/partials/_addresses.ejs", successOptions("Address", "saved"));
  } catch (error) {
    handleError(error);
  }
};
exports.saveCards = async (req, res) => {
  try {
    await new Cards({
      username: req.session.username,
      bank_website: req.body.bank_website,
      bank_name: req.body.bank_name,
      card_number: req.body.card_number,
      card_holder_name: req.body.card_holder_name,
      card_type: req.body.card_type,
      expiry_date: req.body.expiry_date,
      CVV: req.body.CVV,
    }).save();
    res.render("../views/partials/_cards.ejs", successOptions("Card", "saved"));
  } catch (error) {
    handleError(error);
  }
};
exports.saveAccounts = async (req, res) => {
  try {
    await new Accounts({
      username: req.session.username,
      first_name: req.body.fname,
      last_name: req.body.lname,
      bank_name: req.body.bankname,
      account_type: req.body.accounttype,
      account_number: req.body.accountnumber,
      IFSC: req.body.IFSC,
      branch_address: req.body.branchaddress,
      website_url: req.body.website_url,
    }).save();
    res.render("../views/partials/_accounts.ejs", successOptions("Account", "saved"));
  } catch (error) {
    handleError(error);
  }
};

// 2. DELETE PASSWORDS
exports.deletePassword = async (req, res) => {
  try {
    await Passwords.deleteOne({
      website_username: req.body.username,
      website_name: req.body.website_name,
    }).exec();
    res.send(JSON.stringify(successOptions("Password", "deleted")));
  } catch (error) {
    handleError(error);
  }
};
exports.deleteNote = async (req, res) => {
  try {
    await Notes.deleteOne({
      title: req.body.title,
      notename: req.body.notename,
    }).exec();
    res.send(JSON.stringify(successOptions("Note", "deleted")));
  } catch (error) {
    handleError(error);
  }
};
exports.deleteAddress = async (req, res) => {
  try {
    await Address.deleteOne({
      company_name: req.body.company_name,
      address: req.body.address,
    }).exec();
    res.send(JSON.stringify(successOptions("Address", "deleted")));
  } catch (error) {
    handleError(error);
  }
};
exports.deleteCard = async (req, res) => {
  try {
    await Cards.deleteOne({
      card_number: req.body.card_number,
      CVV: req.body.CVV,
    }).exec();
    res.send(JSON.stringify(successOptions("Card", "deleted")));
  } catch (error) {
    handleError(error);
  }
};
exports.deleteAccount = async (req, res) => {
  try {
    await Accounts.deleteOne({
      account_number: req.body.account_number,
      IFSC: req.body.IFSC,
    }).exec();
    res.send(JSON.stringify(successOptions("Account", "deleted")));
  } catch (error) {
    handleError(error);
  }
};

// MISC
exports.greivances = async (req, res) => {
  await new greivances({
    username: req.session.username,
    first_name: req.body.fname,
    email: req.body.email,
    country: req.body.country,
    subject: req.body.subject,
  }).save();
  res.render("../views/pages/contact.ejs", {
    message: "Greivance submitted, we will get back to you soon!",
    title: "SENT!",
    icon: "success",
    confirmButtonText: "OK",
  });
};

exports.contact = (req, res) => {
  res.render("../views/pages/contact.ejs", defaultSweetAlertOptions);
};

exports.decryptPassword = (req, res) => {
  res.send(JSON.stringify(decrypt({ iv: req.body.iv, password: req.body.password })));
};
