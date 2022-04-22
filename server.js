const express = require('express')
const session = require('express-session')
const nodemailer = require('nodemailer')
const http = require('http')
const ejs = require('ejs')
var bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')
const User = require('./models/User')
const Notes = require('./models/Notes')
const Cards = require('./models/Cards')
const Address = require('./models/Addresses')
const Accounts = require('./models/Accounts')
const Passwords = require('./models/Passwords')
const greivances = require('./models/Greivance')
require('dotenv').config()
const {encrypt, decrypt} = require("./public/js/EncryptionHandler.js")

const app = express()
var jsonParser = bodyParser.json()
let port = process.env.PORT
const mongoURI = process.env.DATABASE

mongoose.connect(mongoURI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const store = MongoStore.create({
    mongoUrl: mongoURI,
    collectionName: 'sessions'
}) 
app.set('trust proxy', 1)
app.set('view-engine', ejs)
app.use(session({ 
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    store: store,
    cookie: { 
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 24 * 60 * 60
    }
}))
app.use(express.urlencoded({ extended: false}))
app.use(express.static('public'))

const authenticateUser = (req, res, next) =>{
    if(req.session.loggedin === undefined || req.session.loggedin === "undefined"){
        res.render(__dirname + '/views/pages/Login.ejs', {
            message: "", title: '', icon: '', confirmButtonText: '' 
        })
    }else{
        next()
    }
}

app.get('/', (req, res, next) =>{
    if(req.session.loggedin === "false" || req.session.loggedin === undefined || req.session.loggedin === "undefined"){
        req.session.loggedin = "undefined"
        res.render(__dirname + '/views/pages/index.ejs', {
            message: "", username: req.session.username, loggedin: "false", title: 'Error!', icon: 'error', confirmButtonText: 'Try again' 
        })
    }else{
        req.session.lastaccessed = Date.now()
        res.render(__dirname + '/views/pages/index.ejs', {
            message: "", username: req.session.username, loggedin: "true", title: 'Error!', icon: 'error', confirmButtonText: 'Try again' 
        })
    }
    next()
})

app.get('/login', authenticateUser, async (req,res) =>{
    if(req.session !== undefined){ 
        res.render(__dirname + '/views/pages/vault.ejs', {
            email: req.session.email
        })
    }else{
        res.render(__dirname + '/views/pages/Login.ejs', {
            message: "", title: '', icon: '', confirmButtonText: '' 
        })
    }
})

app.get('/masterpassword', authenticateUser, (req,res) =>{
    if(req.session){
        res.render(__dirname + '/views/pages/MasterPassword.ejs', {
            username: req.session.id, message: "", title: "", icon: "", confirmButtonText: ""
        })
    }else{
        res.render(__dirname + '/views/pages/Login.ejs', {
            message: ""
        })
    }
})

app.get('/generatepassword', (req, res) =>{
    res.render(__dirname + '/views/pages/generate_password.ejs')
})

app.get('/contact', (req, res) =>{
    res.render(__dirname + '/views/pages/contact.ejs', {
        message: "", title: "", icon: "", confirmButtonText: ""
    })
})

app.get('/vault', authenticateUser, (req,res) =>{ // user should be authenticated before they can access the vault
    res.render(__dirname + '/views/pages/vault.ejs', {
        email: req.session.email
    })
})

app.get('/passwords', (req, res) =>{
    res.render(__dirname + '/views/partials/_passwords.ejs', {
        message: "", title: "", icon: "", confirmButtonText: "", saved: false
    })
})
app.get('/notes', (req, res) =>{
    res.render(__dirname + '/views/partials/_notes.ejs', {
        message: "", title: "", icon: "", confirmButtonText: "", saved: false
    })
})
app.get('/addresses', (req, res) =>{
    res.render(__dirname + '/views/partials/_addresses.ejs', {
        message: "", title: "", icon: "", confirmButtonText: "", saved: false
    })
})
app.get('/cards', (req, res) =>{
    res.render(__dirname + '/views/partials/_cards.ejs',{
        message: "", title: "", icon: "", confirmButtonText: "", saved: false
    })
})
app.get('/accounts', (req, res) =>{
    res.render(__dirname + '/views/partials/_accounts.ejs', {
        message: "", title: "", icon: "", confirmButtonText: "", saved: false
    })
})

app.get('/getmypass', async (req, res) =>{
    var userpasswords = []
    if(req.session.loggedin === "true"){
        userpasswords = await Passwords.find({ username: req.session.username }).exec()
        res.send(JSON.stringify(userpasswords))
    }
})
app.get('/getmynotes', async (req, res) =>{
    var usernotes = []
    if(req.session.loggedin === "true"){
        usernotes = await Notes.find({ username: req.session.username }).exec()
        res.send(JSON.stringify(usernotes))
    }
})
app.get('/getmyaddresses', async (req, res) =>{
    var usercards = []
    if(req.session.loggedin === "true"){
        usercards = await Address.find({ username: req.session.username }).exec()
        res.send(JSON.stringify(usercards))
    }
})
app.get('/getmycards', async (req, res) =>{
    var usercards = []
    if(req.session.loggedin === "true"){
        usercards = await Cards.find({ username: req.session.username }).exec()
        res.send(JSON.stringify(usercards))
    }
})
app.get('/getmyaccounts', async (req, res) =>{
    var usercards = []
    if(req.session.loggedin === "true"){
        usercards = await Accounts.find({ username: req.session.username }).exec()
        res.send(JSON.stringify(usercards))
    }
})

function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min + 1) + min
    )
}
random = between(100000,999999).toString()
app.post('/', async (req, res) =>{
    var email = req.body.email
    var username = req.body.username
    req.session.username = username
    req.session.email = email
    req.session.otp = random
    req.session.loggedin = "false"
    req.session.lastaccessed = Date.now()
    req.session.createdOn = Date.now()
    async function emailexists(email){
        try{
            var Exists = await User.findOne({email: email}).exec()
        }catch(err){
            console.error(err);
        }
        return Exists !== null;
    }
    if(await User.findOne({username: username}).exec() !== null){
        res.render(__dirname + '/views/pages/index.ejs', { message: "Username already registered", username: req.session.username,loggedin: false, title: 'Error!', icon: 'error', confirmButtonText: 'Try again' })
    }
    if(await emailexists(email)){
        res.render(__dirname + '/views/pages/index.ejs', { message: "Email already registered", username: req.session.username,loggedin: false, title: 'Error!', icon: 'error', confirmButtonText: 'Try again' })
    }else{
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'pwdt1088@gmail.com',
                  pass: 'passwordist123'
                }
            })
            const options = {
                from: 'pwdt1088@gmail.com',
                to: email,
                subject: 'Your Account Activation Code: ',
                html: `<h1> Welcome aboard!</h1><h2>Your Email was recently used to register at Passwordist, activate your account using the below code:</h2><p style="text-align: center; font-size: x-large;"><b>${random}</b></p>`,
            }
            transporter.sendMail(options, function(err, info){
                if (err) {
                    console.log(err);
                } 
            })
            res.render(__dirname + '/views/pages/verify_otp.ejs', { email: email, message: ""})   
        } catch (error) {
            console.log(error)
        }
    }
})  
app.post('/validateotp', async (req, res) =>{
    const givenotp = req.session.otp
    var otpstring = req.body.first + req.body.second + req.body.third + req.body.fourth + req.body.fifth + req.body.sixth;
    var inputotp = otpstring.toString();
    if(givenotp === inputotp){
        var user = new User({ username: req.session.username, email: req.session.email, createdOn: req.session.createdOn} )
        user.save(), (function(err,collection){
            if(err){
                throw err;
            }
            console.log("User Created Successfully!");
        });
        res.render(__dirname + '/views/pages/MasterPassword.ejs', { username: req.session.username, message: "", title: "", icon: "", confirmButtonText: ""})
    }else {
        res.render(__dirname + '/views/pages/verify_otp.ejs', {email: req.session.email, message: "Invalid OTP"})
    }
})

app.post('/setmasterpassword', async (req, res) =>{
    var password = req.body.master
    var confirmation = req.body.confirmpass
    if(password === confirmation){
        try{
            console.log(await User.findOneAndUpdate({ email: req.session.email }, { $set: { password: await bcrypt.hash(password, 12)}, lastUpdatedPasswordOn: Date.now()}).exec())
            res.render(__dirname + '/views/pages/Login.ejs', {
                message: "Master password set successfully, you can now login to your vault!",
                title: 'CREATED!',
                icon: 'success',
                confirmButtonText: 'OK'
            })
        }catch(err){
            console.error(err);
        }
    }else{
        res.render(__dirname + '/views/pages/MasterPassword.ejs', { username: req.session.username, message: "Passwords do not match!"})
    }
})

app.post('/login', (req, res) =>{
    User.findOne({email: req.body.email}).exec( function(error, user){
        if(error){
            callback({error: true})
        }else if(!user){
            res.render(__dirname + '/views/pages/login.ejs', {
                message: 'No user with that email', title: 'Error!', icon: 'error', confirmButtonText: 'Try again'
            })
        }else{
            user.comparePassword(req.body.password, function(matchError, isMatch) {
                if (matchError) {
                    res.render(__dirname + '/views/pages/Login.ejs', {
                        message: 'Match Error', title: 'Error!', icon: 'error', confirmButtonText: 'Try again'
                    })
                } else if (!isMatch) {
                    res.render(__dirname + '/views/pages/Login.ejs', {
                        message: 'Invalid Password', title: 'Error!', icon: 'error', confirmButtonText: 'Try again'
                    })
                } else {
                    req.session.username = user.username
                    req.session.email = user.email
                    req.session.otp = user.otp
                    req.session.loggedin = "true"
                    req.session.lastaccessed = Date.now()
                    res.render(__dirname + '/views/pages/vault.ejs', {
                        email: req.session.email
                    })
                }
            })
        }
    })
})

app.post('/greivance', async (req, res) =>{
    await new greivances({ username: req.session.username, first_name: req.body.fname, email: req.body.email, country: req.body.country, subject: req.body.subject} ).save()
    res.render(__dirname + '/views/pages/contact.ejs',{
        message: 'Greivance submitted, we will get back to you soon!', title: "SENT!", icon: "success", confirmButtonText: "OK"
    })
})
app.post('/logout', (req, res) =>{
    if(req.session.loggedin !== undefined || req.session.loggedin === "true"){
        req.session.loggedin = "false"
        req.session.destroy();
    }
    res.render(__dirname + '/views/pages/index.ejs', {
        message: 'You have been logged out successfully', username: "", loggedin: false, title: 'LOGGED OUT!', icon: 'success', confirmButtonText: 'OK'
    })
})
app.post('/decryptpassword', jsonParser, (req, res) => {
    res.send(JSON.stringify(decrypt({iv: req.body.iv, password: req.body.password})))
})
app.post('/save-passwords', async (req, res) =>{
    if(req.session.loggedin === "true"){
        try {   
            var web_pass = req.body.site_password
            const encryptedPassword = encrypt(web_pass)
            await new Passwords({ username: req.session.username, website_name: req.body.website_name, website_url: req.body.website_url, website_username: req.body.site_username, website_password: encryptedPassword.password, iv: encryptedPassword.iv} ).save()
            res.render(__dirname + '/views/partials/_passwords.ejs', {
                message: "Password added successfully", title: "CREATED!", icon: "success", confirmButtonText: "OK", saved: true
            })
        } catch (error) {
            console.log(error)
        }
    }else{
        res.render(__dirname + '/views/pages/Login.ejs', {
            message: "", title: '', icon: '', confirmButtonText: '' 
        })
    }
})
app.post('/save-notes', async (req, res) =>{
    if(req.session.loggedin === "true"){
        try {    
            await new Notes({ username: req.session.username, title: req.body.title, date: req.body.date, color: req.body.color, time: req.body.time, note: req.body.note} ).save()
            res.render(__dirname + '/views/partials/_notes.ejs', {
                message: "Note created successfully", title: "CREATED!", icon: "success", confirmButtonText: "OK", saved: true
            })
        } catch (error) {
            console.log(error)
        }
    }else{
        res.render(__dirname + '/views/pages/Login.ejs', {
            message: "", title: '', icon: '', confirmButtonText: '' 
        })
    }
})
app.post('/save-cards', async (req, res) =>{
    if(req.session.loggedin === "true"){
        try {    
            await new Cards({ username: req.session.username, bank_website: req.body.bank_website, bank_name: req.body.bank_name, card_number: req.body.card_number, card_holder_name: req.body.card_holder_name, card_type: req.body.card_type, expiry_date: req.body.expiry_date ,CVV: req.body.CVV} ).save()
            res.render(__dirname + '/views/partials/_cards.ejs', {
                message: "Credit card added successfully", title: "ADDED!", icon: "success", confirmButtonText: "OK", saved: true
            })
        } catch (error) {
            console.log(error)
        }
    }else{
        res.render(__dirname + '/views/pages/Login.ejs', {
            message: "", title: '', icon: '', confirmButtonText: '' 
        })
    }
})
app.post('/save-addresses', async (req, res) =>{
    if(req.session.loggedin === "true"){
        try {    
            await new Address({ username: req.session.username, first_name: req.body.fname, last_name: req.body.lname, company_name: req.body.companyname, address: req.body.address, city: req.body.city, country: req.body.country ,state: req.body.state, postalcode: req.body.postalcode} ).save()
            res.render(__dirname + '/views/partials/_addresses.ejs', {
                message: "Address added successfully", title: "ADDED!", icon: "success", confirmButtonText: "OK", saved: true
            })
        } catch (error) {
            console.log(error)
        }
    }else{
        res.render(__dirname + '/views/pages/Login.ejs', {
            message: "", title: '', icon: '', confirmButtonText: '' 
        })
    }
})
app.post('/save-accounts', async (req, res) =>{
    if(req.session.loggedin === "true"){
        try {    
            await new Accounts({ username: req.session.username, first_name: req.body.fname, last_name: req.body.lname, bank_name: req.body.bankname, account_type: req.body.accounttype, account_number: req.body.accountnumber, IFSC: req.body.IFSC , branch_address: req.body.branchaddress, website_url: req.body.website_url} ).save()
            res.render(__dirname + '/views/partials/_accounts.ejs', {
                message: "Account added successfully", title: "ADDED!", icon: "success", confirmButtonText: "OK", saved: true
            })
        } catch (error) {
            console.log(error)
        }
    }else{
        res.render(__dirname + '/views/pages/Login.ejs', {
            message: "", title: '', icon: '', confirmButtonText: '' 
        })
    }
})
app.post('/deletepass', jsonParser, async (req, res) => {
    if(req.session.loggedin === "true"){
        try {   
            await Passwords.deleteOne({ website_username: req.body.username, website_name: req.body.website_name}).exec()
            var response = { message: "Password deleted successfully", title: "DELETED!", icon: "success", confirmButtonText: "OK", saved: true}
            res.send(JSON.stringify(response))
        } catch (error) {
            console.log(error)
        }
    }else{
        res.render(__dirname + '/views/pages/Login.ejs', {
            message: "", title: '', icon: '', confirmButtonText: ''
        })
    }
})
app.post('/deletenote', jsonParser, async (req, res) => {
    if(req.session.loggedin === "true"){
        try {   
            await Notes.deleteOne({ title: req.body.title, notename: req.body.notename}).exec()
            var response = { message: "Password deleted successfully", title: "DELETED!", icon: "success", confirmButtonText: "OK", saved: true}
            res.send(JSON.stringify(response))
        } catch (error) {
            console.log(error)
        }
    }else{
        res.render(__dirname + '/views/pages/Login.ejs', {
            message: "", title: '', icon: '', confirmButtonText: ''
        })
    }
})
app.post('/deleteadd', jsonParser, async (req, res) => {
    if(req.session.loggedin === "true"){
        try {   
            console.log(await Address.deleteOne({ company_name: req.body.company_name, address: req.body.address}).exec())
            var response = { message: "Address deleted successfully", title: "DELETED!", icon: "success", confirmButtonText: "OK", saved: true}
            res.send(JSON.stringify(response))
        } catch (error) {
            console.log(error)
        }
    }else{
        res.render(__dirname + '/views/pages/Login.ejs', {
            message: "", title: '', icon: '', confirmButtonText: ''
        })
    }
})
app.post('/deletecard', jsonParser, async (req, res) => {
    if(req.session.loggedin === "true"){
        try {   
            console.log(await Cards.deleteOne({ card_number: req.body.card_number, CVV: req.body.CVV}).exec())
            var response = { message: "Card deleted successfully", title: "DELETED!", icon: "success", confirmButtonText: "OK", saved: true}
            res.send(JSON.stringify(response))
        } catch (error) {
            console.log(error)
        }
    }else{
        res.render(__dirname + '/views/pages/Login.ejs', {
            message: "", title: '', icon: '', confirmButtonText: ''
        })
    }
})
app.post('/deleteaccount', jsonParser, async (req, res) => {
    if(req.session.loggedin === "true"){
        try {   
            console.log(await Accounts.deleteOne({ account_number: req.body.account_number, IFSC: req.body.IFSC}).exec())
            var response = { message: "Account deleted successfully", title: "DELETED!", icon: "success", confirmButtonText: "OK", saved: true}
            res.send(JSON.stringify(response))
        } catch (error) {
            console.log(error)
        }
    }else{
        res.render(__dirname + '/views/pages/Login.ejs', {
            message: "", title: '', icon: '', confirmButtonText: ''
        })
    }
})
app.listen(port)