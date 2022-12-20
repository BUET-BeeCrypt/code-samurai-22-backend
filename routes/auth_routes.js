const PromiseRouter = require("express-promise-router");
const AuthController = require("../controller/auth.js");

const router = PromiseRouter();
const controller = new AuthController();

router.post("/register", controller.register);
router.post("/login",controller.login)
module.exports = router;