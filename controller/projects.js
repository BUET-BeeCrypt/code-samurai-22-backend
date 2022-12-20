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
}
module.exports = ProjectController;