const PromiseRouter = require("express-promise-router");
const AuthController = require("../controller/auth.js");
const {authenticateToken} = require("../middleware/authorization.js");

const router = PromiseRouter();
const controller = new AuthController();

router.post("/register", controller.register);
router.post("/login",controller.login)
router.post("/updateRole", authenticateToken, controller.updateUserRole);
module.exports = router;