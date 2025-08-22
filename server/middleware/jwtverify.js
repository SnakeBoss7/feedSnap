const jwt = require('jsonwebtoken');

const verifyUser = (req, res, next) => {
    try {
        // Debug: Log all cookies
        console.log('All cookies:', req.cookies);
        console.log('Headers:', req.headers);
        
        const token = req.cookies.token;
        console.log('Extracted token:', token);
        
        if (!token) {
            console.log('Token not found in cookies');
            return res.status(401).json({ msg: "Unauthorized - No token provided" });
        }
        
        let decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully:', decoded);
        req.user = decoded;
        next();
        
    } catch (err) {
        console.log('JWT verification error:', err.message);
        console.log('Error details:', err);
        return res.status(401).json({ msg: "Invalid token", error: err.message });
    }
}

module.exports = verifyUser;