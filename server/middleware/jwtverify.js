const jwt = require('jsonwebtoken');

const verifyUser = (req, res, next) => {
    try {
         //Debug: Log all cookies
         //.log('All cookies:', req.cookies);
         //.log('Headers:', req.headers);
        
        const token = req.cookies.token;
        //.log('Extracted token:', token);
        
        if (!token) {
            //.log('Token not found in cookies');
            return res.status(401).json({ msg: "Unauthorized - No token provided" });
        }
        
        let decoded = jwt.verify(token, process.env.JWT_SECRET);
         //.log('Token verified successfully:', decoded);
        req.user = decoded;

        next();
        
    } catch (err) {
         //.log('JWT verification error:', err.message);
         //.log('Error details:', err);
        return res.status(401).json({ msg: "Invalid token", error: err.message });
    }
}

module.exports = verifyUser;