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

    // only EXEC can add a proposal
    addProposal = async function (req, res) {
        console.log("UserController.addProposal");
        if(req.body.user.role != "EXEC"){
            // permission denied
            return res.status(403).json({
                success: false,
                code: 403,
                message: "Permission denied."
            });
        }
        const data = await repo.addProposal(
            req.body.project_id, // unique id of the project
            req.body.name, // title of the project
            req.body.location,
            req.body.latitude,
            req.body.longitude,
            req.body.timespan, // Timespan of the project in years
            req.body.goal, // objective of the project
            req.body.proposal_date, // when was the project proposed
            req.body.exec, // executing agency
            req.body.cost // projeced cost in cores
        );
        return res.status(data.code).json(data);
    }
    
    // get proposal by project_id
    getProposal = async function (req, res) {
        console.log("UserController.getProposal");
        console.log(`user role: ${req.body.user.role}`)
        if (req.body.user.role !== "MOP"
            && req.body.user.role !== "ECNEC"
            && req.body.user.role !== "SYSADMIN") {
            return res.status(403).json({
                success: false,
                code: 403,
                message: "Permission denied."
            });
        }
        const data = await repo.getProposal(req.params.project_id);
        return res.status(data.code).json(data);
    }

    // get all proposal
    getAllProposals = async function (req, res) {
        console.log("UserController.getAllProposals");
        // permission denied if not SYSADMIN, MOP or ECNEC
        console.log(`user role: ${req.body.user.role}`)
        if (req.body.user.role != "MOP" 
        && req.body.user.role != "ECNEC"
            && req.body.user.role != "SYSADMIN"){
            return res.status(403).json({
                success: false,
                code: 403,
                message: "Permission denied."
            });
        }
        const data = await repo.getAllProposals();
        return res.status(data.code).json(data);
    }

    // approve project: ECNEC and MOP only
    approveProposal = async function (req, res) {
        console.log("UserController.approveProject");
        if (req.body.user.role != "MOP" && req.body.user.role != "ECNEC") {
            return res.status(403).json({
                success: false,
                code: 403,
                message: "Permission denied."
            });
        }

        const proposalData = await repo.getProposal(req.body.project_id);
        if(!proposalData.success){
            return {
                success: false,
                code: 404,
                message: "Project not found."
            }
        }
        
        console.table(proposalData.data);

        if(proposalData.data.cost > 50 && req.body.user.role === "MOP"){
            return {
                success: false,
                code: 403,
                message: "Permission denied. MOP can approve projects costing up to BDT 50 crores."
            }
        }

        console.log("Permission granted.");

        if(proposalData.data.cost <=50 && req.body.user.role === "ECNEC"){
            return {
                success: false,
                code: 403,
                message: "Permission denied. ECNEC can approve projects costing over BDT 50 crores."
            }
        }
        console.log("Permission granted.");
        const result = await repo.addProject(
            proposalData.data.project_id,
            proposalData.data.name,
            proposalData.data.location,
            proposalData.data.latitude,
            proposalData.data.longitude,
            proposalData.data.exec,
            proposalData.data.cost,
            proposalData.data.timespan,
            proposalData.data.goal,
            req.body.start_date,
            0, // completion percentage
            0 // actual cost
        )

        if (!result.success) {
            return {
                success: false,
                code: 500,
                message: "Internal server error."
            }
        }

        return {
            success: true,
            code: 200,
            message: `Proposal approved.`
        }
    }
}
module.exports = ProjectController;