const ProjectRepository = require("../repository/projects.js");
const repo = new ProjectRepository();

class ProjectController{
    findAll = async function (req, res){
        console.log("ProjectController.findAll");
        const data = await repo.findAll();
        return res.status(200).json(data);
    }

    // insert a project 
    insert = async function (req, res){
        console.log("ProjectController.insert");
        const data = await repo.insert(req.body);
        return res.status(200).json(data);
    }

    addRating = async function (req, res) {
        console.log("UserController.addRating");
        const data = await repo.addRating(
            req.body.user.username,
            req.body.project_id,
            req.body.rating
        );
        return res.status(data.code).json({
            message: data.message,
            code: data.code,
            data: data.data
        });
    }

    addComment = async function (req, res) {
        console.log("UserController.addComment");
        const data = await repo.addComment(
            req.body.user.username, 
            req.body.project_id, 
            req.body.comment
        );
        return res.status(data.code).json(data);
    }

    getComments = async function (req, res) {
        console.log("UserController.getComments");
        const data = await repo.getComments(req.params.project_id);
        return res.status(data.code).json(data);
    }
}
module.exports = ProjectController;