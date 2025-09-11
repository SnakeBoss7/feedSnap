const admin = require('../config/firebaseAdmin');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {tokenGen} = require('../utils/jwtTokenGen')
const cookieConfig = {
            httpOnly: true,
            secure:false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };
const firebaseLogin = async (req, res) => {
    const { idToken } = req.body;
    
    if (!idToken) {
        console.log('token not found');
        return res.status(400).send('Invalid token'); // Add return
    }
    
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name, uid, displayName } = decodedToken;
        const finalName = displayName || name;
        console.log(email)
        let user = await User.findOne({ email: email });

        if (!user) {
            user = await User.create({ email, name: finalName, firebaseId: uid });
        }
        user.firebaseId=uid;
        user.name = finalName;
        await user.save();
        const token = tokenGen(user);
        
        // Fixed cookie configuration
        res.cookie('token', token, cookieConfig);
        
        res.status(200).json({ user, token });
        
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
          return res.status(200).json({message:'working'});
                }
                
            return res.status(409).json({ 
                error: 'User with this email already exists' 
            });
        }
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
    } catch (err) {
        console.log(err);
        return res.status(401).json({ error: 'err' });
    }
    return res.status(200).json({message:'working'});
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
                      return res.status(200).json({mess:'good to go'});
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

module.exports = { firebaseLogin,registerUser,logIn };