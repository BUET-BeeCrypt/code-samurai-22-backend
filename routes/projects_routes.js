const PromiseRouter = require("express-promise-router");
const ProjectController = require("../controller/projects.js");
const { authenticateToken } = require("../middleware/authorization.js");

const router = PromiseRouter();
const controller = new ProjectController();

router.get("/all", authenticateToken ,controller.findAll);
router.post("/rating",authenticateToken, controller.addRating)
router.post("/comment",authenticateToken, controller.addComment)
router.get("/comment/:project_id",authenticateToken, controller.getComments)
router.post("/proposal",authenticateToken, controller.addProposal)
router.get("/proposal/:project_id",authenticateToken, controller.getProposal)
router.get("/proposals",authenticateToken, controller.getAllProposals)
router.post("/proposal/approve",authenticateToken, controller.approveProposal)
module.exports = router;