var express = require("express")
var bodyParser = require("body-parser")
var mongoose = require("mongoose")
var nodemailer = require('nodemailer');
const cookieParser = require("cookie-parser");

const app = express()

const oneDay = 1000 * 60 * 60 * 24;
app.use(function (req, res, next) {
    // check if client sent cookie
    var cookie = req.cookies.cookieName;
    if (cookie === undefined) {
      // no: set a new cookie
      var randomNumber=Math.random().toString();
      randomNumber=randomNumber.substring(2,randomNumber.length);
      res.cookie('cookieName',randomNumber, { maxAge: oneDay, httpOnly: true });
      console.log('cookie created successfully');
    } else {
      // yes, cookie was already present 
      console.log('cookie exists', cookie);
    } 
    next(); 
});



app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cookieParser());
mongoose.connect('mongodb://localhost:27017/user',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min + 1) + min
    )
}
random = between(100000,999999).toString();
function strcmp(a, b){   
    return (a<b?-1:(a>b?1:0));  
}

const fixed = 0;
var db = mongoose.connection
var data;

db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"))

app.get("/",(req,res)=>{
    if(req.query)
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('index.html');
}).listen(3000);

app.post("/sign_up",(req,res)=>{
    sess = req.session;
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

app.post("/validate",(req,res)=>{
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
            console.log("Record Inserted Successfully");
        });
        return res.redirect('MasterPassword.html')
    }else {
        return res.redirect("already_registered.html");
    }
})
app.post("/set_master_password", (req, res)=>{
    sess = req.session;
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

app.post('/login',(req,res) => {
    sess = req.session;
    var views = req.session.views++;
    console.log(views);
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
    req.session.destroy(function() {});
    return res.redirect("/vault.html");
});

console.log("Listening on PORT 3000")