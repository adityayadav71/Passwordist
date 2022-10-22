const Notes = require("../models/Notes");
const Cards = require("../models/Cards");
const Address = require("../models/Addresses");
const Accounts = require("../models/Accounts");
const Passwords = require("../models/Passwords");

const defaultSweetAlertOptions = {
  message: "",
  title: "",
  icon: "",
  confirmButtonText: "",
  saved: false,
};

const servePage = (res, location, alertOptions) => {
  res.render(`../views/${location}`, alertOptions);
};

exports.vault = (req, res) => {
  // user should be authenticated before they can access the vault
  servePage(res, "pages/vault.ejs", {
    email: req.session.email,
  });
};

exports.getPasswordsPage = (req, res) => {
  servePage(res, "partials/_passwords.ejs", defaultSweetAlertOptions);
};
exports.getNotesPage = (req, res) => {
  servePage(res, "partials/_notes.ejs", defaultSweetAlertOptions);
};
exports.getAddressesPage = (req, res) => {
  servePage(res, "partials/_addresses.ejs", defaultSweetAlertOptions);
};
exports.getCardsPage = (req, res) => {
  servePage(res, "partials/_cards.ejs", defaultSweetAlertOptions);
};
exports.getAccountsPage = (req, res) => {
  servePage(res, "partials/_accounts.ejs", defaultSweetAlertOptions);
};

exports.getPasswords = async (req, res) => {
  res.send(
    JSON.stringify(
      await Passwords.find({
        username: req.session.username,
      }).exec()
    )
  );
};

exports.getNotes = async (req, res) => {
  res.send(
    JSON.stringify(await Notes.find({ username: req.session.username }).exec())
  );
};
exports.getAddresses = async (req, res) => {
  res.send(
    JSON.stringify(
      await Address.find({ username: req.session.username }).exec()
    )
  );
};
exports.getCards = async (req, res) => {
  res.send(
    JSON.stringify(await Cards.find({ username: req.session.username }).exec())
  );
};
exports.getAccounts = async (req, res) => {
  res.send(
    JSON.stringify(
      await Accounts.find({ username: req.session.username }).exec()
    )
  );
};
