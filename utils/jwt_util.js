import jwt from "jsonwebtoken";

// info should be an object
export function generateJwtToken(info){
    // console.log("generating jwt")
    // console.log(info);
    const accessToken = jwt.sign(info, process.env.JWT_SECRET, {expiresIn: '14d'}); // 14 days expire date
    return accessToken;
}