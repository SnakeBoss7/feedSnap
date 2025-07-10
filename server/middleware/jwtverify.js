const jwt = require('jsonwebtoken');
const verifyUser = (req, res, next) => 
    {
        try
        {
            console.log("🔥 Middleware triggered2");

            console.log('req',req.cookies);
            console.log(req.cookies)
            const token = req.cookies.token;
            if(!token)
                {
                    console.log('Token not found');
                }
            let decoded = jwt.verify(token,process.env.JWT_SECRET);
            console.log('decoded',decoded)
            req.user=decoded;
            next();
        }catch(err)
        {
            console.log('error fond',err)
        }
    }

module.exports = verifyUser;