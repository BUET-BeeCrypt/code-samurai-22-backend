const PromiseRouter = require("express-promise-router");
const OptimizationController = require("../controller/optimizeController");
const { authenticateToken } = require("../middleware/authorization.js");

const router = PromiseRouter();
const controller = new OptimizationController();

router.get("/all",/* authenticateToken ,*/controller.configureTimeFrame);
module.exports = router;