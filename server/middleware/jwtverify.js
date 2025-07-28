const jwt = require('jsonwebtoken');
const verifyUser = (req, res, next) => 
    {
        try
        {

            const token = req.cookies.token;
            if(!token)
                {
                    console.log('Token not found');
                    res.status(401).json({ msg: "Unauthorized" });
                }
            let decoded = jwt.verify(token,process.env.JWT_SECRET);
            req.user=decoded;
            next();
        }catch(err)
        {
            console.log('error fond',err)
        }
    }

module.exports = verifyUser;