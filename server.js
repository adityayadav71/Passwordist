var express = require("express")
const path = require("path")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")
var nodemailer = require("nodemailer");
var session = require("express-session");
var bcrypt = require("bcryptjs");
const User = require("./models/User");
const MongoDBSession = require("connect-mongodb-session")(session);
// const cookieParser = require("cookie-parser");
const app = express()
app.use('/', express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json());

const mongoURI = "mongodb://localhost:27017/user";

mongoose.connect(mongoURI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((res) => {
    console.log("Connected to Database");
});

var store = new MongoDBSession({
    uri: mongoURI,
    collection: 'mySessions',
})

const oneDay = 1000 * 60 * 60 * 24;
app.use(
    session({
        secret: "This is a secret keyempok21-O(@!)E(Ni3n209Jnoi@jR0I2HD",
        resave: false,
        saveUninitialized: false,
        store: store,
    })
)



const fixed = 0;
var db = mongoose.connection;
var data;
var __dirname = 'public';
function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min + 1) + min
    )
}
random = between(100000,999999).toString();
function strcmp(a, b){   
    return (a<b?-1:(a>b?1:0));  
}


app.get('/', function(req, res) {
    req.session.isAuth = true,
    res.sendFile(path.join('public/index.html', {root: __dirname}).toString());
}).listen(3000);

app.post("/register", async(req,res)=>{
    console.log(req.body)
    const { username, email } = req.body

    try{
        await User.create({
            username, 
            password
        })
        console.log('User created successfully: ', response)
    }catch(error){
        console.log(error)
        return res.json({ status: 'error'})
    }
    var username = req.body.username;
    var email = req.body.email;
    console.log(req.body);
    data = {
        "username": username,
        "email" : email
    }
    async function validateEmailAccessibility(email){
        try{
            var Exists = await db.collection('userdata').findOne({"email": email});
        }catch(err){
            console.error(err);
        }
        return Exists == null;
    }
    validateEmailAccessibility(email).then(function(valid) {
        if (valid) {
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  fixed = random;
                }
            });
            return res.redirect('verify_otp.html');
        } else {
            return res.redirect("already_registered.html");
        }
    });
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'pwdt1088@gmail.com',
          pass: 'passwordist123'
        }
    });
    var mailOptions = {
        from: 'pwdt1088@gmail.com',
        to: email,
        subject: 'Your Account Activation Code: ',
        text: "Your Email was recently used to register at Passwordist, activate your account using the below code:\n".concat(random)
    };
})

app.post("/validateotp",(req,res)=>{
    var one = req.body.first;
    var two = req.body.second;
    var three = req.body.third;
    var four = req.body.fourth;
    var five = req.body.fifth;
    var six = req.body.sixth;
    var otpstring = one + two + three + four + five + six;
    var otp = otpstring.toString();
    if(strcmp(otp, fixed) == 0){
        db.collection('userdata').insertOne(data,(err,collection)=>{
            if(err){
                throw err;
            }
            console.log("OTP verified Successfully");
        });
        return res.redirect('MasterPassword.html')
    }else {
        return res.redirect("already_registered.html");
    }
})
app.post("/set_master_password", (req, res)=>{
    var pass = req.body.master;
    var cpass = req.body.confirmpass;
    if(strcmp(pass, cpass) == 0){
        db.collection('userdata').updateOne({'email': sess.activeuseremail}, {$set: {'MasterPassword': pass}}, (err,collection)=>{
            if(err){
                throw err;
            }
            console.log("Master Password Created successfully");
        });
        res.redirect("Login.html");
    }else{
        res.redirect("password_validation.html");
    }
});

app.post('/auth',(req,res) => {
    var email = req.body.email;
    var password = req.body.password;
    data={
        "email": email,
        "MasterPassword": password
    }
    db.collection('userdata').findOne(data, function(err, existingUser){
        if(existingUser == null){
            return res.redirect("wrong_mp.html");
        }else{
            sess.activeuseremail = req.body.email;
            return res.redirect("vault.html");
        }
    });
});
app.post('/logout',(req,res) => {
    return res.redirect("/vault.html");
});

console.log("Listening on PORT 3000")