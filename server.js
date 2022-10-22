const express = require("express");
const session = require("express-session");
const ejs = require("ejs");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const authController = require("./controllers/authController");
const passwordController = require("./controllers/passwordController");
const vaultController = require("./controllers/vaultController");
const dataController = require("./controllers/dataController");
require("dotenv").config();

const app = express();

let port = process.env.PORT;
const mongoURI = process.env.DATABASE;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const store = MongoStore.create({
  mongoUrl: mongoURI,
  collectionName: "sessions",
});
app.set("trust proxy", 1);
app.set("view-engine", ejs);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    store: store,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 24 * 60 * 60,
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// 1. AUTHENTICATION ROUTES
app.get("/", authController.index);
app.get("/login", authController.authenticateUser, authController.getLoginPage);
app.get(
  "/masterpassword",
  authController.authenticateUser,
  passwordController.getMasterPassword
);
app.get("/generatepassword", passwordController.generatePassword);
app.post("/", authController.signup);
app.post("/validateotp", authController.validateOTP);
app.post("/setmasterpassword", passwordController.setMasterPassword);
app.post("/login", authController.login);
app.post("/logout", authController.logout);
app.post("/decryptpassword", dataController.decryptPassword);

// 2. VAULT ROUTES
app.get("/vault", authController.authenticateUser, vaultController.vault);
app.get(
  "/passwords",
  authController.authenticateUser,
  vaultController.getPasswordsPage
);
app.get(
  "/notes",
  authController.authenticateUser,
  vaultController.getNotesPage
);
app.get(
  "/addresses",
  authController.authenticateUser,
  vaultController.getAddressesPage
);
app.get(
  "/cards",
  authController.authenticateUser,
  vaultController.getCardsPage
);
app.get(
  "/accounts",
  authController.authenticateUser,
  vaultController.getAccountsPage
);

// 3. USER VAULT DATA ROUTES
app.get("/getmypass", vaultController.getPasswords);
app.get("/getmynotes", vaultController.getNotes);
app.get("/getmyaddresses", vaultController.getAddresses);
app.get("/getmycards", vaultController.getCards);
app.get("/getmyaccounts", vaultController.getAccounts);

// 4. MISCELLANEOUS ROUTES
app.get("/contact", dataController.contact);
app.post("/greivance", dataController.greivances);

// 4. DATA CONTROL ROUTES
app.post(
  "/save-passwords",
  authController.authenticateUser,
  dataController.savePasswords
);
app.post(
  "/save-notes",
  authController.authenticateUser,
  dataController.saveNotes
);
app.post(
  "/save-cards",
  authController.authenticateUser,
  dataController.saveCards
);
app.post(
  "/save-addresses",
  authController.authenticateUser,
  dataController.saveAddresses
);
app.post(
  "/save-accounts",
  authController.authenticateUser,
  dataController.saveAccounts
);

app.post("/deletepass", dataController.deletePassword);
app.post("/deletenote", dataController.deleteNote);
app.post("/deleteadd", dataController.deleteAddress);
app.post("/deletecard", dataController.deleteCard);
app.post("/deleteaccount", dataController.deleteAccount);

app.listen(port);
