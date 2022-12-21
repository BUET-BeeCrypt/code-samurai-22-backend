const PromiseRouter = require("express-promise-router");
const projRouter = require("./projects_routes.js");
const optimizedRouter = require("./optimization_routes.js");

const router = PromiseRouter();

router.use("/auth", new require("./auth_routes.js"));
router.use("/projects",projRouter);
router.use("/optimization",optimizedRouter);
module.exports = router;

