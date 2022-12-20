const PromiseRouter = require("express-promise-router");
const ProjectController = require("../controller/projects.js");
const { authenticateToken } = require("../middleware/authorization.js");

const router = PromiseRouter();
const controller = new ProjectController();

router.get("/all", authenticateToken ,controller.findAll);
router.post("/rating",authenticateToken, controller.addRating)
module.exports = router;