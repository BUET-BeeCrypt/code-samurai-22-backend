const PromiseRouter = require("express-promise-router");
const projRouter = require("./projects_routes.js");

const router = PromiseRouter();

router.use("/projects",projRouter);
module.exports = router;

