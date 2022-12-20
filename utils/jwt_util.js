const jwt = require("jsonwebtoken");

// info should be an object
function generateJwtToken(info){
    // console.log("generating jwt")
    // console.log(info);
    const accessToken = jwt.sign(info, process.env.JWT_SECRET_KEY, {expiresIn: '14d'}); // 14 days expire date
    return accessToken;
}

module.exports.generateJwtToken=generateJwtToken;