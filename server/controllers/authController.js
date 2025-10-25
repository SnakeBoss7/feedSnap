const admin = require('../config/firebaseAdmin');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {tokenGen} = require('../utils/jwtTokenGen')
const isProduction = process.env.NODE_ENV === 'prod';

const cookieConfig = {
  httpOnly: true,
  secure: isProduction,              
  sameSite: isProduction ? 'none' : 'lax', 
  maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days
};

const getUserData = async(req,res)=>
    {
try {
            let user = req.user;
        console.log({user});
        const userData = await User.findOne({_id:user.id})
        console.log({userData});
        return res.status(200).json({userData});
    } catch (error) {
    return res.status(400).json({mess:error});
    
}
    }
const firebaseLogin = async (req, res) => {
    const { idToken } = req.body;
        console.log({idToken})
    if (!idToken) {
        console.log('token not found');
        return res.status(400).send('Invalid token'); // Add return
    }
    
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name, uid, displayName } = decodedToken;
        const finalName = displayName || name;
         const userRecord = await admin.auth().getUser(uid);
        const photoURL = userRecord.photoURL || null;
        console.log(email)
        let user = await User.findOne({ email: email });

        if (!user) {
            user = await User.create({ email, name: finalName, firebaseId: uid,profile:photoURL });
        }
        user.firebaseId=uid;
        user.name = finalName;
        user.profile= photoURL
        await user.save();
        const token = tokenGen(user);
        
        // Fixed cookie configuration
        res.cookie('token', token, cookieConfig);
        console.log('User logged in via Firebase:', user);
        return res.status(200).json({ userData:user, token });
        
    } catch (err) {
        console.log('Firebase login error:', err);
        res.status(401).json({ error: err.message });
    }
};

const registerUser = async(req,res)=>
{

     const { name, email, password, confirmPassword } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        console.log(existingUser)
        if (existingUser) {
            if( existingUser.password === "")
                {
                const saltRounds = 12;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                existingUser.password = hashedPassword;
                await existingUser.save();
                  const token = tokenGen(existingUser);
        // Set HTTP-only cookie
        res.cookie('token', token, cookieConfig);
          return res.status(200).json({message:'working',userData:userData});
                }
                
            return res.status(409).json({ 
                error: 'User with this email already exists' 
            });
        }
        console.log({name,email,password,confirmPassword})
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

        // Save user to database
        const savedUser = await newUser.save();
        console.log(savedUser);
        // Generate JWT token
        const token = tokenGen(savedUser)

        // Set HTTP-only cookie
        res.cookie('token', token, cookieConfig);
        return res.status(200).json({message:'working',userData:savedUser});
    } catch (err) {
        console.log(err);
        return res.status(401).json({ error: 'err' });
    }
}
const logIn = async(req,res)=>
    {
          const {email ,password} = req.body;
          console.log({email,password})
          try {
            const existingUser = await User.findOne({ email });
        console.log(existingUser)
        if (!existingUser) {
            return res.status(401).json({mess:'User does not exist'});
          }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if(isPasswordValid)
            {
                let token = tokenGen(existingUser);
                    res.cookie('token', token, cookieConfig);
                      return res.status(200).json({mess:'good to go',userData:existingUser});
            }
            else
                {
                    return res.status(401).json({mess:'Wrong Password'});
                }
          } catch (error) {
             console.log(error);
              return res.status(401).json({mess:'thers some error'});
    }
}

module.exports = { firebaseLogin,registerUser,logIn,getUserData };