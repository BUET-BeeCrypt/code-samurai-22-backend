const bcyrpt = require("bcrypt");
const ProjectRepository = require("../repository/auth");
const repo = new ProjectRepository();
const {generateJwtToken} = require("../utils/jwt_util")

class AuthController{
    register = async function (req, res){
        console.log("inside register");
        const cred = req.body;
        const username = cred.username;
        const password = await bcyrpt.hash(cred.password, 10);
        const role = cred.role;
        if (!username || !password || !role)
            return res.status(400).json({ message: "Bad request." });

        const data = await repo.register(username, password, role);
        if (!data.success){
            return res.status(data.code).json(data);
        }
        return res.status(201).json(data);
    }

    login = async function (req, res){
        console.log("inside login")
        const cred = req.body;
        const username = cred.username;
        const password = cred.password;
        const role = cred.role;

        if(!username || !password || !role)
            return res.status(400).json({message: "Bad request."});
        
        const user = await repo.getUser(username);

        if(!user.success){
            return res.status(user.code).json({
                message: user.message,
                code: user.code
            });
        }

        const passwordValid = await bcyrpt.compare(password, user.data.password);
        if(!passwordValid){
            return res.status(401).json({
                message: "Invalid credentials.",
                code: 401
            });
        }

        const token = {username: username, role: role};
        const jwt = generateJwtToken(token);


        return res.status(200).json({token:jwt});
    }
}
module.exports = AuthController;