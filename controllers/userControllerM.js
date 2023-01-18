const User = require('../models/UserM')
const Beneficiary = require('../models/Beneficiary')
const UserOTPVerification = require('../models/UserVerification')
// const UserOTPVerification = require('../models/UserVerification')
const mongoose = require('mongoose')

const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const {encrypt, decrypt} = require('../middllwars/crypte')

const dotenv = require('dotenv');
const UserVerification = require('../models/UserVerification')
dotenv.config();

 // create reusable transporter object using the default SMTP transport

 const transport = nodemailer.createTransport({
     
    service: "gmail",
        auth: {
            user: process.env.EMAIL,  // TODO: your gmail account
            pass: process.env.PASSWORD // TODO: your gmail password
        }
    })

exports.getUserCurrentSold = (req, res, next) => {
    var Query = User.findOne({_id: req.params.Uid})
    Query.exec((err, user) => {
        if(err)
            return res.status(400).json({error: err})
        req.userCurrentSold = user
        next()
    })
}
    
exports.updateThisUserSoldVitamix = (req, res) => {
    console.log(req.userCurrentSold.solde_vitamix, req.body.sumOfPrice);
    if((parseInt(req.userCurrentSold.solde_vitamix) - parseInt(req.body.sumOfPrice)) < 0)
        return res.status(400).json({error: "recharger votre font"})
    let restOfFont = parseInt(req.userCurrentSold.solde_vitamix) - parseInt(req.body.sumOfPrice)
    var Query = User.updateOne({_id: req.params.Uid}, {solde_vitamix: restOfFont}, {returnOriginal: true, new: true, upsert: true, rawResult: true})
    Query.exec((err, user) => {
        if(err)
            return res.status(400).json({error: err})

        res.json(user)
    })
}

exports.checkThisEmailIfExist = (req, res, next) => {
    User.find({email: req.body.email}, (err, data) => {
        if(err || !data || data.length >= 1)
            return res.status(400).json({error:"cette email déjà exist"})
        next() 
    })
}

exports.signup = (req, res) => {
    try {
        if(req.body.confirmPass !== req.body.password || !req.body.confirmPass) {
            return res.status(400).json({error: "Les mots de passe saisis ne sont pas identiques."})
        }

        const user = new User(req.body)

        // user.save((err, user) => {
        //     if(err) {
        //         return res.status('400').json({error: err})
        //     }

        //     res.send(user)
        // })
        user.save().then((result)=>{
            verificationSendMail(result, res)
        })
    }
    catch(error) {
        res.status(400).json(error)
    }
}

exports.signin = (req, res) => {
    try {
        const {email, password} = req.body;
        console.log(email)

        User.findOne({email}, (err, user) => {
            if(err || !user) {
                return res.status(400).json({error: "Ce compte n'existe pas ! Veuillez-vous inscrire"})
            }
            if(user.verified != true) {
                return res.status(400).json({error: "Ce compte n'a pas été vérifié"})
            }
            if(decrypt(user.password) != password) {
                return res.status(400).json({error: 'Veuillez entrer un mot de passe correct'})
            }

            // expire after 1 hours exp: Math.floor(Date.now() / 1000) + (60 * 60)
            const token = jwt.sign({_id: user._id, role: user.role, exp: Math.floor(Date.now() / 1000) + (24 * 1440)}, process.env.JWT_SECRET, { algorithm: 'HS256' }); 
    
            res.cookie('token', token, { expire: new Date() + 5000 })

            const {_id, name, email, role, phone, Point_Fidilite, solde_vitamix} = user;

            // return res.json({
            // token, user: {_id, name, email, role}
            // })
            return res.json({ token, _id, name, email, phone, Point_Fidilite, role, solde_vitamix })
        })
    }
    catch(error) {

    }
}

exports.userById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if(err || !user) {
            return res.status(404).json({
                error: "Ce compte n'existe pas ! Veuillez-vous inscrire"
            })
        }

        req.profile = user;
        next();
    })
}

exports.getOneUser = (req, res) => {
    res.json({
        user: req.profile
    })
}

exports.SignOut = (req, res) =>  {
    res.clearCookie('token');

    res.json({
        message: "Vous êtes déconnecté"
    })
}

exports.updateUserPassword = (req, res) => {
    if(req.body.Password != req.body.RPassword) {
        return res.status(400).json({error: "Les mots de passe saisis ne sont pas identiques"})
    }

    if(req.body.Password == "" || req.body.RPassword == "")
        return res.status(400).json({error: "Entrer votre mot de pass"})

    var userPasswordObject = {
        password: encrypt(req.body.Password),
    }

    User.findOneAndUpdate({_id: req.params.UserID}, userPasswordObject, (err, user) => {
        if(req.body.oldPassword != decrypt(user.password))
            return res.status(400).json({error: "Le mot de passe actuel saisi est incorrect"})
        if(err)
            return res.status(400).json({error: "server error"})

        res.json("le mot de pass a été modifiée")
    })
}

 // -----Transfer de Points----- 
 exports.TransferPoints = async (req, res) => {

    const option = {new : true}
    const idFROM = req.params.userIdFrom
    const idTO = req.params.userIdTo
    
    const userFrom = await User.findById(idFROM);
    
    User.findById(idTO).exec( async(err, user) => {
        if(err || !user) {
            return res.status(404).json("Cet utilisateur n'existe pas")
        }
        if(user.verified === false){
            return res.status(404).json("Ce compte n'est pas disponible actuellement")
        }
        if(userFrom.Point_Fidilite < req.body.point){
            return res.status(404).json("Le nombre de points que vous avez n'est pas suffisant")
        }
    
        const result = await User.findByIdAndUpdate( idTO,
             {
                Point_Fidilite: user.Point_Fidilite + Number(req.body.point)
             }, 
             option
        )
        

        if(result){
            
            const dataUserFrom = await User.findByIdAndUpdate( idFROM,
                {
                  Point_Fidilite: userFrom.Point_Fidilite - Number(req.body.point)
                }, 
                option
            )

            res.status(200).json(result)
        }
        else{
            res.send('error')
        }
       
    })
}

// Add Beneficiary
  exports.AddBeneficiary = async(req, res)=>{

    try{

    const  id = req.params.userId

    const { data } = req.body;
    User.findById(id).exec( async(err, user) => {
        if(err || !user) {
            return res.status(404).json("Cet utilisateur n'existe pas")
        }
        if(user.verified === false){
            return res.status(404).json("Ce compte n'est pas disponible actuellement")
        }
        else{
            Beneficiary.find({id_user_beneficiary: id, userId: req.body.userId}).exec((error, beneficiary)=>{
                if(error || beneficiary.length > 0) {
                    // res.send(beneficiary)
                    return res.status(404).json("Cet beneficiary déjà exist")
                }
                else{
                    const newBeneficairy = new Beneficiary(req.body)

                    newBeneficairy.save((err, result)=>{
    
                    if(err) {
                        res.status(400).json(err)
                    }
                    
                    res.status(200).json("Bien reçu")
    
                    })
                }
              
            })
            
        }
        
            // const newBeneficairy = new Beneficiary(req.body)

            // newBeneficairy.save((err, result)=>{

            // if(err) {
            //     res.status(400).json(err)
            // }
            // res.status(200).json(" SUCCESS ")

            // })

    })

    }

    catch(error){
        
    }
}

exports.getBeneficiaryByUserId = (req, res) => {
    const id = req.params.userId;

    Beneficiary.find({userId: id}).exec((err, beneficiary) => {
        if(err || !beneficiary) {
            return res.status(404).json( "ACCUN RESULT" )
        }

        res.status(200).json(beneficiary)
       
    })
};

exports.addRequest = async (req, res) => {

    // exports.sendFriendRequest = async (data) => {

    const data = req.body
    // res.send(data.myName)
        try{   
            // await mongoose.connect();
    
            await User.updateOne({_id: data.friendId}, 
                { 
                    $push : {friendRequest : {name: data.myName, id: data.myId}}
                }
            );
            await User.updateOne({_id: data.myId}, 
                { 
                    $push : {friendRequest : {name: data.friendName, id: data.friendId}}
                }
            );
            // mongoose.disconnect();
            return res.status(200).json("nadiii canaaadi");
        }
        catch(error){
            // mongoose.disconnect();
            console.log(error);
        }
          
    // }

    // User.sendFriendRequest(req.body)
    // .then(response =>{
    //     res.send('nadi canadi')
    // })
    // .catch(err=>{
    //     console.log(err)
    // })

}


exports.verifiyOtp = async (req, res) => {

        try{   
            let {userId, otp} = req.body;
            const userVerify = await UserVerification.find({userId})
            // res.send(userVerify[0]);

            if(userVerify.length <= 0){
                res.status(400).json("Account records doesn't exist or has been verified already. Please sinup or login");
            }
            else{
                const { createdAt } = userVerify[0];
                const otpV = userVerify[0].otp;
                // console.log(createdAt)
                var expires = Math.floor(Math.abs(createdAt - Date.now()) / 36e5)
            
                if(expires >= 1){
                    await UserOTPVerification.deleteMany({userId});
                    res.status(400).json("Code has expired. Please request again");
                    // res.json("miiimity")
                }
                else{
                  
                    if(otp == otpV){
                        await User.updateOne({_id: userId}, {verified: true})
                        res.status(200).json("User Email verified successfully");
                    }
                    else{
                        res.status(400).json("Code invalide passé. vérifier votre boîte de réception")
                    }
                }
            }
         }
        catch(error){
            // mongoose.disconnect();
            console.log(error);
        }
          
}

exports.resendOtp = async (req, res) => {
    try{
        let {userId, email} = req.body
        if(!userId || !email){
            res.status(400).json("Empty user details are not allowed")
        }
        else{
            await UserOTPVerification.deleteMany({userId});
            verificationSendMail({_id: userId, email}, res)
        }
    }
    catch(err){
        res.status(400).json(err.message)
    }
}



const verificationSendMail = async({_id, email}, res)=>{
    console.log(_id, email, process.env.EMAIL)
    try{
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

           // send mail with defined transport object
           const mailOption = {
            from: process.env.EMAIL, 
            to: email, 
            subject: "Verify your Email", 
            text: "Hello world?", 
            html:  `
            <p>Bienvenue chez Vitamix Agadir</p><br>
            <p>Veuillez entrer l'enregistrement OTP pour commencer: ${otp}</p><br>
            <p>le code <b>expire 1 heure</b></p>
          `,
        };
        // hash the OTP
        // const saltRounds = 10;

        // const hashedOTP = await bcrypt.hash(otp, saltRounds);
        // const hashedOTP = encrypt(otp);
        const newOTPVerification = await new UserOTPVerification({
            userId: _id,
            otp: otp
        });
        await newOTPVerification.save();
        await transport.sendMail(mailOption);

        res.json({
            status: "Penden",
            message: "Verification otp email sent",
            data: {
                userId: _id,
                email
            }
        })

    }
    catch(error){
        console.log(error)
        res.json({
            status: "ERROR",
            message: "MAWSAL WALOOO",
        })
    }
}

exports.checkUserIfAlreadyExist = (req, res, next) => {
    let Query = User.findOne({email: req.body.email})

    Query.exec((err, user) => {
        if(err)
            return res.status(400).json({error: err})

        next()
    })
}

exports.updateUserInfo = (req, res) => {
    var userObject = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
    }
    User.findOneAndUpdate({_id: req.params.Uid}, userObject, (err, user) => {
        if(err)
            return res.status(400).json({error: err})

        res.json("votre information a été modifié")
    })
}