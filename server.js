const express = require('express')
const session = require('express-session')
const nodemailer = require('nodemailer')
const ejs = require('ejs')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')
const User = require('./models/User')
const Notes = require('./models/Notes')
const Cards = require('./models/Cards')
const Passwords = require('./models/Passwords')

const app = express()

const mongoURI = "mongodb://localhost:27017/users"

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
    secret: 'g8&*&^gv087go8yg8o7gs087BUBo8yVY*&VOUV&^FWVD)yubOW#@*&Bhb',
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

app.get('/vault', authenticateUser, (req,res) =>{ // user should be authenticated before they can access the vault
    res.render(__dirname + '/views/pages/vault.ejs', {
        email: req.session.email
    })
})

app.get('/passwords', (req, res) =>{
    res.render(__dirname + '/views/partials/_passwords.ejs'), {
        message: "", title: "", icon: "", confirmButtonText: ""
    }
})

app.get('/notes', (req, res) =>{
    res.render(__dirname + '/views/partials/_notes.ejs', {
        message: "", title: "", icon: "", confirmButtonText: "", saved: false
    })
})

app.get('/addresses', (req, res) =>{
    res.render(__dirname + '/views/partials/_addresses.ejs'), {
        message: "", title: "", icon: "", confirmButtonText: ""
    }
})

app.get('/cards', (req, res) =>{
    res.render(__dirname + '/views/partials/_cards.ejs',{
        message: "", title: "", icon: "", confirmButtonText: "", saved: false
    })
})

app.get('/accounts', (req, res) =>{
    res.render(__dirname + '/views/partials/_accounts.ejs'), {
        message: "", title: "", icon: "", confirmButtonText: ""
    }
})

app.get('/getmypass', async (req, res) =>{
    var userpasswords = []
    if(req.session.loggedin === "true"){
        userpasswords = await Passwords.findOne({})
        console.log(userpasswords)
        res.send(userpasswords)
    }
})

app.get('/getmynotes', async (req, res) =>{
    var usernotes = []
    if(req.session.loggedin === "true"){
        usernotes = await Notes.find({ username: req.session.username }).exec()
        res.send(JSON.stringify(usernotes))
    }
})

app.get('/getmycards', async (req, res) =>{
    var usercards = []
    if(req.session.loggedin === "true"){
        usercards = await Cards.find({ username: req.session.username }).exec()
        console.log(usercards)
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

app.post('/logout', (req, res) =>{
    if(req.session.loggedin !== undefined || req.session.loggedin === "true"){
        req.session.loggedin = "false"
        req.session.destroy();
    }
    res.render(__dirname + '/views/pages/index.ejs', {
        message: 'You have been logged out successfully', username: "", loggedin: false, title: 'LOGGED OUT!', icon: 'success', confirmButtonText: 'OK'
    })
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
            await new Cards({ username: req.session.username, card_number: req.body.card_number, card_holder_name: req.body.card_holder_name, card_type: req.body.card_type, expiry_date: req.body.expiry_date ,CVV: req.body.CVV} ).save()
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

app.listen(3000)