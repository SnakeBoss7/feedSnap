const jwt = require('jsonwebtoken');
 const tokenGen =(user)=>
    {
         const token = jwt.sign(
                    { 
                        id: user._id,
                        name: user.name,
                        email: user.email 
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '7d' }
                );
        return token;
    }
module.exports = {tokenGen}

