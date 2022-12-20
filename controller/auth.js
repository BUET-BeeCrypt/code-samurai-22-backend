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
        if (!username || !password)
            return res.status(400).json({ message: "Bad request." });

        // default role APP
        const data = await repo.register(username, password, "APP");
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

        if(!username || !password)
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

        const token = {username: username, role: user.data.role};
        const jwt = generateJwtToken(token);


        return res.status(200).json({token:jwt});
    }

    // only system admin can update user role
    updateUserRole = async function (req, res){
        // check user permision
        const req_role = req.body.user.role;
        if(req_role !== "SYSADMIN"){
            return res.status(403).json({
                message: "Permission denied.",
                code: 401
            });
        }

        const role = req.body.role;
        const username = req.body.username;

        // check if user exist
        const user = await repo.getUser(username);
        if(!user.success){
            return res.status(user.code).json({
                message: user.message,
                code: user.code
            });
        }

        // update role
        const updateRes = await repo.updateUserRole(username, role);
        if (!updateRes.success){
            return res.status(updateRes.code).json({
                message: updateRes.message,
                code: updateRes.code
            });
        }

        return res.status(200).json(updateRes);
    }

    // get user types
    getUserTypes = async function (req, res){
        const userTypes = await repo.getUserTypes();
        return res.status(userTypes.code).json(userTypes);
    }

    // get all users: admin only
    getAllUsers = async function (req, res){
        // check user permision
        const req_role = req.body.user.role;
        if(req_role !== "SYSADMIN"){
            return res.status(403).json({
                message: "Permission denied.",
                code: 401
            });
        }

        const users = await repo.getAllUsers();
        return res.status(users.code).json(users);
    }

    // get user by username: admin only
    getUser = async function (req, res){
        // check user permision
        const req_role = req.body.user.role;
        if(req_role !== "SYSADMIN"){
            return res.status(403).json({
                message: "Permission denied.",
                code: 401
            });
        }

        const username = req.params.username;
        console.log(username);
        const user = await repo.getUser(username);
        return res.status(user.code).json(user);
    }
}
module.exports = AuthController;