const admin = require('../config/firebaseAdmin')
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const  firebaseLogin = async (req,res) =>
    {
        const { idToken } = req.body;
        if(!idToken) 
            {
                console.log('token not found');
                res.status(400).send('Invalid token');
            }
        try
        {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const {email,name,uid,displayName} =decodedToken;
            const finalName = displayName || name;
            let user = await User.findOne({email:email});
            if(!user)
            {
                user = await User.create({email,name:finalName,firebaseId:uid})
            }
            const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});
            res.cookie('token',token,  {httpOnly: true,sameSite: 'lax', secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 })
            res.status(200).json({user,token});
        }catch(err)
        {
            console.log(err);
            res.status(401).json({err});

        }
    };
module.exports = {firebaseLogin};