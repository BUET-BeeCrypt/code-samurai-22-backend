const PromiseRouter = require("express-promise-router");
const ProjectController = require("../controller/projects.js");

const router = PromiseRouter();
const controller = new ProjectController();

router.get("/all", controller.findAll);
module.exports = router;