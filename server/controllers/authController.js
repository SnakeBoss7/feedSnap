const admin = require('../config/firebaseAdmin');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

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
        
        let user = await User.findOne({ email: email });
        if (!user) {
            user = await User.create({ email, name: finalName, firebaseId: uid });
        }
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        
        // Fixed cookie configuration
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false, // Only secure in production
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/' // Ensure cookie is available on all paths
        });
        
        res.status(200).json({ user, token });
        
    } catch (err) {
        console.log('Firebase login error:', err);
        res.status(401).json({ error: err.message });
    }
};

module.exports = { firebaseLogin };