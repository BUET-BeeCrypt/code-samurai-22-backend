const ProjectRepository = require("../repository/projects.js");
const repo = new ProjectRepository();

class ProjectController{
    findAll = async function (req, res){
        console.log("inside findAll")
        const data = await repo.findAll();
        return res.status(200).json(data);
    }
}
module.exports = ProjectController;